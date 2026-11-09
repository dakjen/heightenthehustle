/**
 * Reset links: minting them, redeeming them, and throwing them away.
 *
 * The token in the emailed link is 32 random bytes. Only its SHA-256 is
 * stored, so a leaked `password_reset_tokens` row cannot be turned back into a
 * working link. A row is single-use (`usedAt`) and expires after an hour, and
 * every outstanding row for a user is dropped whenever their password changes
 * by any route — so an old "forgot password" email in an inbox stops working
 * the moment the account is back under the owner's control.
 *
 * This is a plain module, not a `"use server"` file, on purpose: `issueToken()`
 * mints a credential, so it must never be reachable as a server action.
 */
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull, lt, or } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, type User } from "@/db/schema";
import { appUrl } from "@/lib/email";

/** How long an emailed link stays good. Long enough to find the email, short enough to matter. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Phrased for the email and the expired-link page, so the two always agree. */
export const RESET_TOKEN_TTL_LABEL = "1 hour";

/** Tokens live in the URL and in emails, so keep them URL-safe. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Create a reset row for `userId` and return the raw token for the link.
 *
 * Any outstanding token for that user is invalidated first, so the newest
 * email is the only one that works — a person who clicks "resend" twice can't
 * be confused by which link is live.
 */
export async function issueToken(userId: number, requestedIp?: string): Promise<string> {
  await invalidateTokens(userId);

  const token = randomBytes(32).toString("base64url");
  await db.insert(passwordResetTokens).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    requestedIp: requestedIp ?? null,
  });
  return token;
}

/** The absolute URL to email someone for `token`. */
export function resetLink(token: string): string {
  return `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
}

/** A token row joined to the account it belongs to. */
export interface ResolvedToken {
  tokenId: number;
  user: Pick<User, "id" | "name" | "email" | "status">;
}

/**
 * Look up an unused, unexpired token without spending it.
 *
 * Used by the reset page so a bad or stale link shows "ask for a new one"
 * instead of a form that is going to fail on submit. Returns null for a
 * missing, used, expired or malformed token — the caller must not tell the
 * visitor which, since that distinction is only useful to someone guessing.
 */
export async function findValidToken(token: unknown): Promise<ResolvedToken | null> {
  if (typeof token !== "string" || token.length === 0 || token.length > 256) return null;

  const row = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.tokenHash, hashToken(token)),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, new Date()),
    ),
    with: {
      user: { columns: { id: true, name: true, email: true, status: true } },
    },
  });

  if (!row?.user) return null;
  // Only an approved account can sign in, so only an approved account has a
  // password worth resetting.
  if (row.user.status !== "approved") return null;
  return { tokenId: row.id, user: row.user };
}

/**
 * Mark a token spent, but only if it is still unspent.
 *
 * Returns false when another request got there first, which is what makes a
 * token single-use even if the same link is submitted twice at once: the
 * `usedAt IS NULL` condition is checked by the database, not by us.
 */
export async function spendToken(tokenId: number): Promise<boolean> {
  const spent = await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(passwordResetTokens.id, tokenId), isNull(passwordResetTokens.usedAt)))
    .returning({ id: passwordResetTokens.id });
  return spent.length > 0;
}

/**
 * Drop every outstanding reset row for a user.
 *
 * Call this after any password change — reset link, signed-in change, admin
 * action — so links already sitting in an inbox stop working.
 */
export async function invalidateTokens(userId: number): Promise<void> {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
}

/**
 * Housekeeping: delete rows that can no longer be redeemed.
 *
 * Cheap and best-effort; called opportunistically when a reset is requested so
 * the table doesn't grow forever without needing a scheduled job.
 */
export async function pruneExpiredTokens(): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db
      .delete(passwordResetTokens)
      .where(or(lt(passwordResetTokens.expiresAt, new Date()), lt(passwordResetTokens.createdAt, cutoff)));
  } catch (error) {
    console.warn("[password-reset] pruning expired tokens failed:", error);
  }
}

"use server";

import { sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { FormState } from "@/types/form-state";
import { passwordResetEmail, sendEmail } from "@/lib/email";
import { issueToken, pruneExpiredTokens, resetLink, RESET_TOKEN_TTL_LABEL } from "@/lib/password-reset";
import { clientIp, hit, retryMessage } from "@/lib/rate-limit";

/**
 * Reset requests allowed per hour, counted per email address and per IP.
 * Each request sends an email, so the email limit also stops this form being
 * used to flood somebody's inbox.
 */
const RESET_WINDOW_MS = 60 * 60 * 1000;
const RESET_LIMIT_PER_EMAIL = 3;
const RESET_LIMIT_PER_IP = 10;

/**
 * The same answer whether or not the address has an account, so this form
 * can't be used to find out who is a member. The email is only sent when
 * there is an approved account behind the address.
 */
const RESET_REQUESTED =
  "If an account exists for that email address, we've sent a link to reset the password. Check your inbox — and your spam folder.";

export async function requestPasswordReset(prevState: FormState, formData: FormData): Promise<FormState> {
  const email = ((formData.get("email") as string | null) ?? "").trim().toLowerCase();
  if (!email) {
    return { message: "", error: "Enter the email address for your account." };
  }

  const ip = await clientIp();
  const byIp = hit(`reset:ip:${ip}`, RESET_LIMIT_PER_IP, RESET_WINDOW_MS);
  const byEmail = hit(`reset:email:${email}`, RESET_LIMIT_PER_EMAIL, RESET_WINDOW_MS);
  if (byIp.limited || byEmail.limited) {
    const wait = retryMessage(Math.max(byIp.retryAfterSeconds, byEmail.retryAfterSeconds));
    return { message: "", error: `Too many reset requests. Please try again in ${wait}.` };
  }

  try {
    // Case-insensitive match, the same as sign-in.
    const user = await db.query.users.findFirst({
      where: sql`lower(${users.email}) = ${email}`,
      columns: { id: true, name: true, email: true, status: true },
    });

    // Only an approved account can sign in, so only an approved account has a
    // password worth resetting. Either way the caller sees RESET_REQUESTED.
    if (user && user.status === "approved") {
      const token = await issueToken(user.id, ip);
      await sendEmail({
        to: { email: user.email, name: user.name },
        ...passwordResetEmail(user.name, resetLink(token), RESET_TOKEN_TTL_LABEL),
      });
    }

    await pruneExpiredTokens();
  } catch (error) {
    // Don't leak which half failed; a retry is the right next step either way.
    console.error("Password reset request failed:", error);
    return { message: "", error: "We couldn't start a password reset just now. Please try again." };
  }

  return { message: RESET_REQUESTED, error: "" };
}

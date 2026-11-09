"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { FormState } from "@/types/form-state";
import { passwordChangedEmail, sendEmail } from "@/lib/email";
import { validateNewPassword } from "@/lib/password";
import { hashPassword } from "@/lib/password-hash";
import { findValidToken, invalidateTokens, spendToken } from "@/lib/password-reset";
import { clientIp, hit, retryMessage } from "@/lib/rate-limit";
import { clearSession } from "@/lib/session";

/**
 * Submissions allowed per IP per 15 minutes. The token itself is unguessable,
 * so this is only here to stop a flood of bcrypt hashing.
 */
const SUBMIT_WINDOW_MS = 15 * 60 * 1000;
const SUBMIT_LIMIT_PER_IP = 20;

/** Shown for a token that is missing, already used, expired or tampered with. */
const BAD_TOKEN = "This reset link is no longer valid. Request a new one and try again.";

export async function resetPassword(prevState: FormState, formData: FormData): Promise<FormState> {
  const token = formData.get("token");
  const password = formData.get("password");
  const confirmation = formData.get("confirmPassword");

  const rate = hit(`reset-submit:ip:${await clientIp()}`, SUBMIT_LIMIT_PER_IP, SUBMIT_WINDOW_MS);
  if (rate.limited) {
    return { message: "", error: `Too many attempts. Please try again in ${retryMessage(rate.retryAfterSeconds)}.` };
  }

  const problem = validateNewPassword(password, confirmation);
  if (problem) {
    return { message: "", error: problem, fieldErrors: { password: problem } };
  }

  let name: string;
  let email: string;
  try {
    const resolved = await findValidToken(token);
    if (!resolved) {
      return { message: "", error: BAD_TOKEN };
    }

    // Spend the token before writing the password: if two submissions race,
    // only the one that flips `usedAt` proceeds.
    if (!(await spendToken(resolved.tokenId))) {
      return { message: "", error: BAD_TOKEN };
    }

    await db
      .update(users)
      .set({ password: await hashPassword(password as string) })
      .where(eq(users.id, resolved.user.id));

    // Any other link already sitting in their inbox stops working now.
    await invalidateTokens(resolved.user.id);
    name = resolved.user.name;
    email = resolved.user.email;
  } catch (error) {
    console.error("Password reset failed:", error);
    return { message: "", error: "We couldn't reset your password just now. Please try again." };
  }

  // Whoever is holding this browser is not necessarily signed in as this
  // account — drop any session cookie so they sign in fresh with the new
  // password.
  await clearSession();

  // Tell the account holder their password moved. Never fails the reset.
  await sendEmail({ to: { email, name }, ...passwordChangedEmail(name) });

  redirect("/login?reset=1");
}

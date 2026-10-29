"use server";

import { FormState } from "@/types/form-state";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/login/actions";
import { revalidatePath } from "next/cache";
import { createSession } from "@/lib/session";
import { safeUserColumns } from "@/lib/users";
import { validateNewPassword } from "@/lib/password";
import { hashPassword, verifyPassword } from "@/lib/password-hash";
import { invalidateTokens } from "@/lib/password-reset";
import { passwordChangedEmail, sendEmail } from "@/lib/email";
import { hit, reset, retryMessage } from "@/lib/rate-limit";

/** Password-change attempts allowed per account per 15 minutes. */
const CHANGE_WINDOW_MS = 15 * 60 * 1000;
const CHANGE_LIMIT = 5;

export async function optOutUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session || !session.user) {
    return { message: "", error: "Unauthorized." };
  }

  const enteredName = formData.get("name") as string;

  if (enteredName !== session.user.name) {
    return { message: "", error: "Name does not match. Please try again." };
  }

  try {
    await db.update(users)
      .set({ isOptedOut: true })
      .where(eq(users.id, session.user.id));
    
    revalidatePath("/dashboard/settings");
    return { message: "You have successfully opted out of communications.", error: "" };
  } catch (error) {
    console.error("Error opting out user:", error);
    return { message: "", error: "Failed to update your preferences. Please try again." };
  }
}

/**
 * Change the signed-in user's password.
 *
 * Requires the current password: a session cookie alone must not be enough,
 * so a borrowed or stolen browser session can't lock the owner out of their
 * own account.
 */
export async function changePassword(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { message: "", error: "Please sign in again." };
  }
  const userId = session.user.id;

  const currentPassword = formData.get("currentPassword");
  const password = formData.get("password");
  const confirmation = formData.get("confirmPassword");

  if (typeof currentPassword !== "string" || currentPassword.length === 0) {
    const problem = "Enter your current password.";
    return { message: "", error: problem, fieldErrors: { currentPassword: problem } };
  }

  const problem = validateNewPassword(password, confirmation);
  if (problem) {
    return { message: "", error: problem, fieldErrors: { password: problem } };
  }

  // Each attempt costs a bcrypt comparison, so cap guesses at the current
  // password even though the caller is already signed in.
  const rate = hit(`change-password:user:${userId}`, CHANGE_LIMIT, CHANGE_WINDOW_MS);
  if (rate.limited) {
    return { message: "", error: `Too many attempts. Please try again in ${retryMessage(rate.retryAfterSeconds)}.` };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, name: true, email: true, password: true },
    });
    if (!user) {
      return { message: "", error: "Please sign in again." };
    }

    if (!(await verifyPassword(currentPassword, user.password))) {
      const wrong = "That isn't your current password.";
      return { message: "", error: wrong, fieldErrors: { currentPassword: wrong } };
    }

    if (await verifyPassword(password as string, user.password)) {
      const same = "Your new password must be different from your current one.";
      return { message: "", error: same, fieldErrors: { password: same } };
    }

    await db
      .update(users)
      .set({ password: await hashPassword(password as string) })
      .where(eq(users.id, userId));

    // Any "forgot password" link already sitting in their inbox stops working.
    await invalidateTokens(userId);

    // Reissue the session so its 24-hour clock restarts from this change
    // rather than from the original sign-in.
    const refreshed = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: safeUserColumns,
    });
    if (refreshed) await createSession(refreshed);

    // Settled: one typo shouldn't count against the next real change.
    reset(`change-password:user:${userId}`);

    // Tell the account holder, in case it wasn't them. Never fails the change.
    await sendEmail({ to: { email: user.email, name: user.name }, ...passwordChangedEmail(user.name) });

    revalidatePath("/dashboard/settings");
    return { message: "Your password has been changed.", error: "" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { message: "", error: "We couldn't change your password just now. Please try again." };
  }
}

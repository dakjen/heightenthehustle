"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";
import { FormState } from "@/types/form-state";
import AuthShell from "@/app/components/AuthShell";
import { Field, FormError, FormSuccess, SubmitButton, inputClass, primaryButtonClass } from "@/app/components/form";

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState<FormState, FormData>(requestPasswordReset, { message: "" });
  const sent = Boolean(state?.message && !state.error);

  return (
    <AuthShell
      title="Reset password"
      subtitle="Tell us the email address on your account and we'll send you a link to choose a new password."
    >
      {sent ? (
        <div className="space-y-5">
          <FormSuccess message={state.message} />
          <p className="text-sm text-[#606060]">
            The link works once and expires in an hour. If it doesn&apos;t arrive in a few minutes, check your spam
            folder before requesting another.
          </p>
          <Link href="/login" className={`${primaryButtonClass} w-full`}>
            Back to login
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          <Field name="email" label="Email address" required>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </Field>

          <FormError message={state?.error} />

          <SubmitButton pendingText="Sending…" className={`${primaryButtonClass} w-full`}>
            Send reset link
          </SubmitButton>

          <p className="text-center text-sm text-[#606060]">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold text-[#910000] hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "./actions";
import { FormState } from "@/types/form-state";
import { Field, FormError, SubmitButton, inputClass, primaryButtonClass } from "@/app/components/form";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from "@/lib/password";

/** The new-password form behind a valid reset link. */
export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(resetPassword, { message: "" });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <Field name="password" label="New password" required hint={PASSWORD_HINT} error={state?.fieldErrors?.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </Field>

      <Field name="confirmPassword" label="Confirm new password" required>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </Field>

      <FormError message={state?.error} />

      <SubmitButton pendingText="Saving…" className={`${primaryButtonClass} w-full`}>
        Set new password
      </SubmitButton>

      <p className="text-center text-sm text-[#606060]">
        <Link href="/login" className="font-semibold text-[#910000] hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}

/**
 * What a bad, used or expired link shows instead of the form. Lives in this
 * client module so the page itself imports only components across the
 * client boundary, never the shared class-name constants.
 */
export function ResetLinkExpired({ ttlLabel }: { ttlLabel: string }) {
  return (
    <div className="space-y-5">
      <FormError
        message={`Reset links work once and expire after ${ttlLabel}. This one has been used, has expired, or was incomplete.`}
      />
      <Link href="/forgot-password" className={`${primaryButtonClass} w-full`}>
        Request a new link
      </Link>
      <p className="text-center text-sm text-[#606060]">
        <Link href="/login" className="font-semibold text-[#910000] hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}

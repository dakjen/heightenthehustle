"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "./actions";
import { FormState } from "@/types/form-state";
import { Field, FormError, FormSuccess, SubmitButton, inputClass } from "@/app/components/form";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from "@/lib/password";

/** Settings panel for changing your own password while signed in. */
export default function ChangePasswordForm() {
  const [state, formAction] = useActionState<FormState, FormData>(changePassword, { message: "" });
  const formRef = useRef<HTMLFormElement>(null);
  const done = Boolean(state?.message && !state.error);

  // Clear the fields once it worked, so three passwords aren't left on screen.
  useEffect(() => {
    if (done) formRef.current?.reset();
  }, [done]);

  return (
    <form ref={formRef} action={formAction} className="hth-card max-w-lg space-y-5 p-6">
      <Field
        name="currentPassword"
        label="Current password"
        required
        error={state?.fieldErrors?.currentPassword}
      >
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>

      <Field name="password" label="New password" required hint={PASSWORD_HINT} error={state?.fieldErrors?.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
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
          className={inputClass}
        />
      </Field>

      <FormError message={state?.error} />
      <FormSuccess message={done ? state.message : undefined} />

      <SubmitButton pendingText="Changing…">Change password</SubmitButton>
    </form>
  );
}

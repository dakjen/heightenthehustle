"use client";

import { useActionState } from "react";
import { joinWaitlist } from "./cohort-actions";
import { FormState } from "@/types/form-state";
import { Field, SubmitButton, FormError, FormSuccess, inputClass, invalidProps } from "@/app/components/form";

interface WaitlistFormProps {
  cohortId: number;
  cohortName: string;
  defaultName: string;
  defaultEmail: string;
  defaultPhone?: string;
  defaultBusinessName?: string;
}

export default function WaitlistForm({ cohortId, cohortName, defaultName, defaultEmail, defaultPhone = "", defaultBusinessName = "" }: WaitlistFormProps) {
  const [state, formAction] = useActionState<FormState, FormData>(joinWaitlist, { message: "" });
  const errors = state.fieldErrors ?? {};
  const done = Boolean(state.message && !state.error);

  if (done) {
    return <FormSuccess message={state.message} />;
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="cohortId" value={cohortId} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Your name" required error={errors.name}>
          <input id="name" name="name" type="text" required autoComplete="name" defaultValue={defaultName} className={inputClass} {...invalidProps("name", errors)} />
        </Field>
        <Field name="email" label="Email" required error={errors.email}>
          <input id="email" name="email" type="email" required autoComplete="email" defaultValue={defaultEmail} className={inputClass} {...invalidProps("email", errors)} />
        </Field>
        <Field name="phone" label="Phone" error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={defaultPhone} className={inputClass} {...invalidProps("phone", errors)} />
        </Field>
        <Field name="businessName" label="Business name" error={errors.businessName}>
          <input id="businessName" name="businessName" type="text" autoComplete="organization" defaultValue={defaultBusinessName} className={inputClass} />
        </Field>
        <Field name="notes" label="Anything you'd like us to know?" error={errors.notes} className="sm:col-span-2">
          <textarea id="notes" name="notes" rows={2} placeholder="What you're hoping to get out of the curriculum…" className={inputClass} />
        </Field>
      </div>
      <FormError message={state.error} />
      <SubmitButton pendingText="Joining…">Join the {cohortName} waitlist</SubmitButton>
    </form>
  );
}

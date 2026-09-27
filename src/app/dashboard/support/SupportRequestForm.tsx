"use client";

import { useActionState } from "react";
import { createSupportRequest } from "./actions";
import { FormState } from "@/types/form-state";
import { Field, FormSection, SubmitButton, FormError, FormSuccess, RequiredNote, inputClass, invalidProps } from "@/app/components/form";

interface Props {
  categories: readonly string[];
  businesses: { id: number; businessName: string }[];
  onDone?: () => void;
}

export default function SupportRequestForm({ categories, businesses, onDone }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(createSupportRequest, { message: "" });
  const errors = state.fieldErrors ?? {};
  const done = Boolean(state.message && !state.error);

  if (done) {
    return (
      <div className="space-y-4">
        <FormSuccess message={state.message} />
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm font-semibold text-[#910000] hover:underline">
            Back to my requests
          </button>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <FormSection step="01" title="What do you need help with?" description="Pick the closest category. If it's a line of credit, loan or grant, say roughly how much.">
        <Field name="category" label="Type of help" required error={errors.category}>
          <select id="category" name="category" required defaultValue="" className={inputClass} {...invalidProps("category", errors)}>
            <option value="" disabled>Choose one…</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        {businesses.length > 0 && (
          <Field name="businessId" label="For which business?" hideOptional>
            <select id="businessId" name="businessId" defaultValue={businesses.length === 1 ? String(businesses[0].id) : ""} className={inputClass}>
              <option value="">Not business-specific</option>
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.businessName}</option>)}
            </select>
          </Field>
        )}
        <Field name="subject" label="Short title" required error={errors.subject} className="sm:col-span-2">
          <input id="subject" name="subject" type="text" required placeholder="e.g. Help securing a $50k line of credit" className={inputClass} {...invalidProps("subject", errors)} />
        </Field>
        <Field name="details" label="Tell us the situation" required error={errors.details} className="sm:col-span-2" hint="What you've tried, where you're stuck, and what a win looks like.">
          <textarea id="details" name="details" rows={5} required className={inputClass} {...invalidProps("details", errors)} />
        </Field>
      </FormSection>

      <FormSection step="02" title="Amount & timing" description="Optional, but it helps us prioritize.">
        <Field name="amountNeeded" label="Amount (if funding)" error={errors.amountNeeded}>
          <input id="amountNeeded" name="amountNeeded" type="text" inputMode="decimal" placeholder="$50,000" className={inputClass} />
        </Field>
        <Field name="neededBy" label="Needed by" error={errors.neededBy}>
          <input id="neededBy" name="neededBy" type="date" className={inputClass} {...invalidProps("neededBy", errors)} />
        </Field>
        <Field name="urgency" label="Urgency" required error={errors.urgency}>
          <select id="urgency" name="urgency" defaultValue="normal" className={inputClass}>
            <option value="low">Low: whenever you can</option>
            <option value="normal">Normal: in the next few weeks</option>
            <option value="high">High: this is time-sensitive</option>
          </select>
        </Field>
      </FormSection>

      <FormError message={state.error} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <RequiredNote />
        <SubmitButton pendingText="Sending…">Send request</SubmitButton>
      </div>
    </form>
  );
}

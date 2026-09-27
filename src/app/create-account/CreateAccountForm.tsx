"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createAccount } from "./actions";
import AuthShell from "@/app/components/AuthShell";
import {
  Field, FormError, FormSuccess, RequiredNote, SubmitButton,
  inputClass, primaryButtonClass,
} from "@/app/components/form";
import type { PitchEventOption } from "@/app/dashboard/intake-form/actions";
import SearchSelect from "@/app/components/SearchSelect";

const initialState = {
  message: "",
  error: "",
};

/** Lightweight group header used inside the single auth card. */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#910000]">{title}</legend>
      {children}
    </fieldset>
  );
}

export default function CreateAccountForm({ pitchEvents }: { pitchEvents: PitchEventOption[] }) {
  const [state, formAction] = useActionState(createAccount, initialState);
  const success = Boolean(state.message && !state.error);
  const errors = state.fieldErrors ?? {};

  return (
    <AuthShell
      title="Request an Account"
      subtitle="Request access. We review every request and email you within 48 hours."
    >
      {success ? (
        <div className="space-y-6">
          <FormSuccess message={state.message} />
          <Link href="/login" className={`${primaryButtonClass} w-full`}>
            Back to login
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-8">
          <Group title="About you">
            <Field name="name" label="Full name" required>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Jordan Rivera"
                className={inputClass}
              />
            </Field>
            <Field name="phone" label="Phone number" required>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                placeholder="(555) 555-5555"
                className={inputClass}
              />
            </Field>
          </Group>

          <Group title="Sign-in details">
            <Field name="email" label="Email address" required hint="This is where we'll send your approval.">
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
            <Field name="password" label="Password" required hint="At least 8 characters. Mix letters and numbers for a stronger password.">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className={inputClass}
              />
            </Field>
          </Group>

          <Group title="Your business">
            <Field name="businessName" label="Business name" hint="Leave blank if you're still at the idea stage.">
              <input
                id="businessName"
                name="businessName"
                type="text"
                autoComplete="organization"
                placeholder="e.g. Hustle Coffee Co."
                className={inputClass}
              />
            </Field>
          </Group>

          <Group title="Pitch competition">
            <Field
              name="pitchEvent"
              label="Which pitch competition were you in?"
              required
              error={errors.pitchEvents || errors.pitchEventOther}
              hint="Type a city or event name, e.g. Cleveland, Deanwood or DC. Not listed? Just type it and pick “Use …”."
            >
              <SearchSelect
                id="pitchEvent"
                name="pitchEvent"
                required
                options={pitchEvents.map((ev) => ({ value: String(ev.id), label: ev.name }))}
                otherValue="other"
                otherName="pitchEventOther"
                pinned={[{ value: "none", label: "I haven't pitched yet" }]}
                invalid={Boolean(errors.pitchEvents || errors.pitchEventOther)}
                describedBy={errors.pitchEvents || errors.pitchEventOther ? "pitchEvent-error" : undefined}
              />
            </Field>
          </Group>

          <FormError message={state.error} />

          <div className="space-y-3">
            <SubmitButton pendingText="Sending request…" className={`${primaryButtonClass} w-full`}>
              Request account
            </SubmitButton>
            <RequiredNote />
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[#606060]">
        Already have access?{" "}
        <Link href="/login" className="text-[#910000] font-semibold hover:underline">
          Login
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-gray-500">
        By creating an account, you agree to our{" "}
        <a
          href="https://app.termly.io/policy-viewer/policy.html?policyUUID=62daf5ff-d858-4aae-9bd5-717cb57cd833"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#910000] hover:underline"
        >
          Terms and Conditions
        </a>.
      </p>
    </AuthShell>
  );
}

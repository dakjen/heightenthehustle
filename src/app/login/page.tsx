"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "./actions";
import { FormState } from "@/types/form-state";
import AuthShell from "@/app/components/AuthShell";
import { Field, FormError, SubmitButton, inputClass, primaryButtonClass } from "@/app/components/form";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [state, formAction] = useActionState<FormState, FormData>(login, { message: "" });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />

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

      <Field name="password" label="Password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </Field>

      <FormError message={state?.error} />

      <SubmitButton pendingText="Signing in…" className={`${primaryButtonClass} w-full`}>
        Login
      </SubmitButton>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Login"
      subtitle="Sign in to reach your business profile, messages, classes and funding opportunities."
    >
      <Suspense fallback={<div className="h-56" aria-hidden="true" />}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-[#606060]">
        New here?{" "}
        <Link href="/create-account" className="text-[#910000] font-semibold hover:underline">
          Request an account
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-gray-500">
        By logging in, you agree to our{" "}
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

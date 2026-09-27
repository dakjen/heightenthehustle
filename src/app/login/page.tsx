"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { FormState } from "@/types/form-state";
import Link from "next/link";
import AuthShell from "@/app/components/AuthShell";

const inputClass =
  "appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#910000]/30 focus:border-[#910000] sm:text-sm text-black transition";

export default function LoginPage() {
  const [state, formAction] = useActionState<FormState, FormData>(login, { message: "" });

  return (
    <AuthShell
      title="Login"
      subtitle="Stay connected by signing up and sharing your business information. This allows us to refer you to relevant opportunities, send you grant funding applications, and provide free resources to help your business grow and thrive."
    >
      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#606060]">
            Email address
          </label>
          <div className="mt-1">
            <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#606060]">
            Password
          </label>
          <div className="mt-1">
            <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
          </div>
        </div>

        {state?.error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{state.error}</p>
        )}

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-md text-sm font-semibold text-white bg-[#910000] hover:bg-[#7a0000] hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#910000]"
          >
            Login
          </button>
        </div>
      </form>

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

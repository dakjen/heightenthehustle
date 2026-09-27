'use client';

import { createAccount } from "./actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/app/components/AuthShell";

const initialState = {
  message: "",
  error: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-md text-sm font-semibold text-white bg-[#910000] hover:bg-[#7a0000] hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#910000] disabled:opacity-60"
    >
      {pending ? "Requesting Account..." : "Request Account"}
    </button>
  );
}

export default function CreateAccountPage() {
  const [state, formAction] = useActionState(createAccount, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      // Optionally redirect or clear form after success
      // For now, just show the message
      console.log("Account request message:", state.message);
    }
    if (state.error) {
      console.error("Account request error:", state.error);
    }
  }, [state, router]);

  return (
    <AuthShell title="Request an Account" subtitle="Tell us a bit about yourself and our team will approve your access.">
        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#606060]">
              Name
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#910000]/30 focus:border-[#910000] sm:text-sm text-black transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#606060]">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#910000]/30 focus:border-[#910000] sm:text-sm text-black transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-[#606060]">
              Business Name (Optional)
            </label>
            <div className="mt-1">
              <input
                id="businessName"
                name="businessName"
                type="text"
                autoComplete="organization"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#910000]/30 focus:border-[#910000] sm:text-sm text-black transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#606060]">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#910000]/30 focus:border-[#910000] sm:text-sm text-black transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#606060]">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#910000]/30 focus:border-[#910000] sm:text-sm text-black transition"
              />
            </div>
          </div>

          <SubmitButton />

          {state.message && <p className="mt-4 text-center text-green-600">{state.message}</p>}
          {state.error && <p className="mt-4 text-center text-red-600">{state.error}</p>}
        </form>
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

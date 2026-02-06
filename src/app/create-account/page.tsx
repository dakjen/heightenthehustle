'use client';

import { createAccount } from "./actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link

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
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#910000] hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#910000]"
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="absolute top-4 left-4"> {/* Position the back link */}
        <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back
        </Link>
      </div>
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-black text-center mb-8">Request an Account</h1>
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
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#910000] focus:border-[#910000] sm:text-sm text-black"
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
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#910000] focus:border-[#910000] sm:text-sm text-black"
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
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#910000] focus:border-[#910000] sm:text-sm text-black"
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
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#910000] focus:border-[#910000] sm:text-sm text-black"
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
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#910000] focus:border-[#910000] sm:text-sm text-black"
              />
            </div>
          </div>

          <SubmitButton />

          {state.message && <p className="mt-4 text-center text-green-600">{state.message}</p>}
          {state.error && <p className="mt-4 text-center text-red-600">{state.error}</p>}
        </form>
      </div>
    </div>
  );
}

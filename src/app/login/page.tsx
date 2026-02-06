"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { FormState } from "@/types/form-state";
import Link from "next/link"; // Import Link

export default function LoginPage() {
  const [state, formAction] = useActionState<FormState, FormData>(login, { message: "" });

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
        <h1 className="text-4xl font-bold text-black text-center mb-8">Login</h1>
        <p className="text-center text-gray-600 mb-6">
          Stay connected by signing up and sharing your business information. This allows us to refer you to relevant opportunities, send you grant funding applications, and provide free resources to help your business grow and thrive.
        </p>
        <form action={formAction} className="space-y-6">
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
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#910000] focus:border-[#910000] sm:text-sm text-black"
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#910000] hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#910000]"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
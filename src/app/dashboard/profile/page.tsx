"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { updateProfile } from "./actions";
import { getSession } from "@/app/login/actions";

type FormState = {
  message: string;
  error: string;
} | undefined;

export default function ProfilePage() {
  const [state, formAction] = useFormState<FormState, FormData>(updateProfile, undefined);
  const [user, setUser] = useState<{ name: string; email: string; phone: string } | null>(null);

  useEffect(() => {
    async function fetchSession() {
      const session = await getSession();
      if (session && session.user) {
        setUser(session.user);
      }
    }
    fetchSession();
  }, []);

  if (!user) {
    return <div className="flex-1 p-6">Loading profile...</div>;
  }

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Profile Editor</h1>
      <p className="mt-4 text-gray-700">Manage your profile information.</p>

      <div className="mt-8 max-w-md">
        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={user.email}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={user.phone}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {state?.message && (
            <p className="text-sm text-green-600">{state.message}</p>
          )}
          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

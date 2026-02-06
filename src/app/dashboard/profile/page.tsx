"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { FormState } from "@/types/form-state";
import { updateProfile } from "./actions";
import { getSession } from "@/app/login/actions";
import Image from "next/image";

// Define a type for the user object in state, matching the updated schema
interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  personalAddress: string | null;
  personalCity: string | null;
  personalState: string | null;
  personalZipCode: string | null;
  profilePhotoUrl: string | null;

  isTransgender: boolean;
}

const isPlaceholder = (url: string | null | undefined): boolean => {
  return url?.includes('example.com') ?? false;
};

export default function ProfilePage() {
  const [state, formAction] = useActionState<FormState, FormData>(updateProfile, { message: "" });
  const [user, setUser] = useState<UserProfile | null>(null); // Use UserProfile type

  useEffect(() => {
    async function fetchAndSetUser() {
      const session = await getSession();
      if (session && session.user) {
        // Cast session.user to UserProfile to match state type
        setUser(session.user as UserProfile);
      }
    }
    fetchAndSetUser();
  }, [state?.message]); // Safely access state.message

  if (!user) {
    return <div className="flex-1 p-6">Loading profile...</div>;
  }

  return (
    <div className="flex-1 p-6">
      {/* Profile Photo Display */}
      <div className="mb-6 flex justify-center">
        {user.profilePhotoUrl && !isPlaceholder(user.profilePhotoUrl) ? (
          <Image src={user.profilePhotoUrl} alt="Profile" width={96} height={96} className="rounded-full object-cover border-2 border-gray-300" />
        ) : (
          <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold border-2 border-gray-300">
            {user.name ? user.name[0].toUpperCase() : '?'}
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Your Personal Profile</h1> {/* Renamed heading */}
      <p className="mt-4 text-gray-700">Manage your personal information.</p>

      <div className="mt-8 max_w_md">
        <form action={formAction} className="space-y-6">
          {/* Profile Photo */}
          {user.profilePhotoUrl && !isPlaceholder(user.profilePhotoUrl) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Profile Photo</label>
              <Image src={user.profilePhotoUrl} alt="Profile" width={80} height={80} className="mt-1 rounded-full object-cover" />
            </div>
          )}
          <div>
            <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700">
              Upload Profile Photo
            </label>
            <input
              id="profilePhoto"
              name="profilePhoto"
              type="file"
              className="mt-1 block w-full text-sm text-gray-900
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-[#910000] file:text-white
                hover:file:bg-[#7a0000]"
            />
          </div>

          {/* Email Address (Read-only) */}
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

          {/* Name */}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* Phone */}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* Personal Address */}
          <div>
            <label htmlFor="personalAddress" className="block text-sm font-medium text-gray-700">
              Personal Address
            </label>
            <input
              id="personalAddress"
              name="personalAddress"
              type="text"
              defaultValue={user.personalAddress || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* Personal City */}
          <div>
            <label htmlFor="personalCity" className="block text-sm font-medium text-gray-700">
              Personal City
            </label>
            <input
              id="personalCity"
              name="personalCity"
              type="text"
              defaultValue={user.personalCity || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* Personal State */}
          <div>
            <label htmlFor="personalState" className="block text-sm font-medium text-gray-700">
              Personal State
            </label>
            <input
              id="personalState"
              name="personalState"
              type="text"
              maxLength={2}
              defaultValue={user.personalState || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* Personal Zip Code */}
          <div>
            <label htmlFor="personalZipCode" className="block text-sm font-medium text-gray-700">
              Personal Zip Code
            </label>
            <input
              id="personalZipCode"
              name="personalZipCode"
              type="text"
              maxLength={10}
              defaultValue={user.personalZipCode || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* Transgender Checkbox */}
          <div className="flex items-center">
            <input
              id="isTransgender"
              name="isTransgender"
              type="checkbox"
              defaultChecked={user.isTransgender}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isTransgender" className="ml-2 block text-sm text-gray-900">
              Are you transgender?
            </label>
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

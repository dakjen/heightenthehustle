"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { createBusinessProfile, getBusinessProfile } from "./actions";
import { SessionPayload } from "@/app/login/actions";

type FormState = {
  message: string;
  error: string;
} | undefined;

export default function BusinessesPage() {
  const [state, formAction] = useFormState<FormState, FormData>(createBusinessProfile, undefined);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [businessProfile, setBusinessProfile] = useState<any | null>(null); // Use 'any' for now, define a proper type later

  useEffect(() => {
    async function fetchSessionAndProfile() {
      const currentSession = await getSession();
      setSession(currentSession);

      if (currentSession && currentSession.user) {
        const profile = await getBusinessProfile(currentSession.user.id);
        setBusinessProfile(profile);
      }
    }
    fetchSessionAndProfile();
  }, []);

  if (!session || !session.user) {
    return <div className="flex-1 p-6">Loading user session...</div>;
  }

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
      <p className="mt-4 text-gray-700">Create or manage your business profile.</p>

      <div className="mt-8 max-w-2xl">
        <form action={formAction} className="space-y-6">
          {/* Owner's Name */}
          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
              Owner's Name
            </label>
            <input
              id="ownerName"
              name="ownerName"
              type="text"
              defaultValue={businessProfile?.ownerName || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Percent Ownership */}
          <div>
            <label htmlFor="percentOwnership" className="block text-sm font-medium text-gray-700">
              Percent Ownership
            </label>
            <input
              id="percentOwnership"
              name="percentOwnership"
              type="number"
              step="0.01"
              defaultValue={businessProfile?.percentOwnership || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              defaultValue={businessProfile?.businessName || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Business Type */}
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
              Business Type
            </label>
            <select
              id="businessType"
              name="businessType"
              defaultValue={businessProfile?.businessType || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Business Type</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</option>
              <option value="Corporation">Corporation</option>
            </select>
          </div>

          {/* Business Tax Status */}
          <div>
            <label htmlFor="businessTaxStatus" className="block text-sm font-medium text-gray-700">
              Business Tax Status
            </label>
            <select
              id="businessTaxStatus"
              name="businessTaxStatus"
              defaultValue={businessProfile?.businessTaxStatus || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Tax Status</option>
              <option value="S-Corporation">S-Corporation</option>
              <option value="C-Corporation">C-Corporation</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
          </div>

          {/* Business Description */}
          <div>
            <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
              Business Description
            </label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              rows={3}
              defaultValue={businessProfile?.businessDescription || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* Business Industry */}
          <div>
            <label htmlFor="businessIndustry" className="block text-sm font-medium text-gray-700">
              Business Industry
            </label>
            <input
              id="businessIndustry"
              name="businessIndustry"
              type="text"
              defaultValue={businessProfile?.businessIndustry || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              defaultValue={businessProfile?.address || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              defaultValue={businessProfile?.phone || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="text"
              defaultValue={businessProfile?.website || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Business Materials Upload */}
          <div>
            <label htmlFor="businessMaterials" className="block text-sm font-medium text-gray-700">
              Business Materials
            </label>
            <input
              id="businessMaterials"
              name="businessMaterials"
              type="file"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-[#910000] file:text-white
                hover:file:bg-[#7a0000]"
            />
            {businessProfile?.businessMaterialsUrl && (
              <p className="mt-2 text-sm text-gray-500">
                Current materials: <a href={businessProfile.businessMaterialsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">View</a>
              </p>
            )}
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
              Save Business Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

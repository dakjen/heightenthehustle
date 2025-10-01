"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { createBusinessProfile, getAllUserBusinesses, fetchSession } from "./actions";
import { SessionPayload, fetchSession } from "@/app/login/actions";
import { useRouter } from "next/navigation";

type FormState = {
  message: string;
  error: string;
} | undefined;

// Define a type for a single business (matching your schema)
interface Business {
  id: number;
  userId: number;
  businessName: string;
  ownerName: string;
  percentOwnership: string;
  businessType: string;
  businessTaxStatus: string;
  businessDescription: string | null;
  businessIndustry: string;
  businessMaterialsUrl: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  website: string | null;
  isArchived: boolean;
}

export default function BusinessesPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [userBusinesses, setUserBusinesses] = useState<Business[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false); // State to toggle form visibility

  // Form state for creating a new business
  const [createState, createFormAction] = useFormState<FormState, FormData>(createBusinessProfile, undefined);

  useEffect(() => {
    async function fetchSessionAndBusinesses() {
      const currentSession = await fetchSession();
      setSession(currentSession);

      if (currentSession && currentSession.user) {
        const businesses = await getAllUserBusinesses(currentSession.user.id);
        setUserBusinesses(businesses);
      }
    }
    fetchSessionAndBusinesses();
  }, [createState]); // Re-fetch businesses when a new one is created

  // Handle successful creation and redirect
  useEffect(() => {
    if (createState?.message && !createState.error) {
      setShowCreateForm(false); // Hide form on success
      // Optionally, show a success toast or message
    }
  }, [createState]);

  if (!session || !session.user) {
    return <div className="flex-1 p-6">Loading user session...</div>;
  }

  const handleBusinessClick = (businessId: number) => {
    router.push(`/dashboard/businesses/${businessId}`);
  };

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Your Businesses</h1>
      <p className="mt-4 text-gray-700">Manage all your registered businesses.</p>

      <div className="mt-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {showCreateForm ? "Cancel" : "Create New Business"}
        </button>
      </div>

      {showCreateForm && (
        <div className="mt-8 max-w-2xl p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Business Profile</h2>
          <form action={createFormAction} className="space-y-6">
            {/* Owner's Name */}
            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                Owner&#39;s Name
              </label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
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
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
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
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
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
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
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
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
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
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* Street Address */}
          <div>
            <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              id="streetAddress"
              name="streetAddress"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              maxLength={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* Zip Code */}
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
              Zip Code
            </label>
            <input
              id="zipCode"
              name="zipCode"
              type="text"
              maxLength={10}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
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
              className="mt-1 block w-full text-sm text-gray-900
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-[#910000] file:text-white
                hover:file:bg-[#7a0000]"
            />
          </div>

          {createState?.message && (
            <p className="text-sm text-green-600">{createState.message}</p>
          )}
          {createState?.error && (
            <p className="text-sm text-red-600">{createState.error}</p>
          )}

          <div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create Business Profile
            </button>
          </div>
        </form>
      </div>
      )} {/* End of showCreateForm conditional rendering */}

      {/* Display existing businesses */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userBusinesses.length === 0 && !showCreateForm ? (
          <p className="text-gray-700">You don&#39;t have any businesses yet. Click &quot;Create New Business&quot; to get started!</p>
        ) : (
          userBusinesses.map((business) => (
            <div
              key={business.id}
              onClick={() => handleBusinessClick(business.id)}
              className={`cursor-pointer p-6 rounded-lg shadow-md transition-all duration-200
                ${business.isArchived ? 'bg-gray-200 text-gray-500 opacity-60' : 'bg-white hover:shadow-lg'}`}
            >
              <h3 className="text-xl font-bold text-gray-900">{business.businessName}</h3>
              <p className="mt-2 text-sm text-gray-600">Owner: {business.ownerName}</p>
              <p className="text-sm text-gray-600">Type: {business.businessType}</p>
              {business.isArchived && (
                <p className="mt-2 text-sm font-semibold text-red-600">Archived</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { getBusinessProfile, updateBusinessProfile, archiveBusiness } from "../actions"; // Relative import
import { SessionPayload } from "@/app/login/actions";
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
  percentOwnership: number;
  businessType: string;
  businessTaxStatus: string;
  businessDescription?: string;
  businessIndustry: string;
  businessMaterialsUrl?: string;
  address?: string;
  phone?: string;
  website?: string;
  isArchived: boolean;
}

export default function BusinessDetailsPage({ params }: { params: { businessId: string } }) {
  const router = useRouter();
  const businessId = parseInt(params.businessId);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [updateState, updateFormAction] = useFormState<FormState, FormData>(updateBusinessProfile.bind(null, businessId), undefined);
  const [archiveState, archiveAction] = useFormState<FormState, number>(archiveBusiness, undefined);


  useEffect(() => {
    async function fetchSessionAndBusiness() {
      const currentSession = await getSession();
      setSession(currentSession);

      if (currentSession && currentSession.user) {
        const fetchedBusiness = await getBusinessProfile(businessId);
        if (fetchedBusiness && fetchedBusiness.userId === currentSession.user.id) {
          setBusiness(fetchedBusiness);
        } else {
          // Redirect if business not found or not owned by user
          router.push("/dashboard/businesses");
        }
      }
    }
    fetchSessionAndBusiness();
  }, [businessId, updateState, archiveState, router]); // Re-fetch on update/archive

  if (!session || !session.user || !business) {
    return <div className="flex-1 p-6">Loading business details...</div>;
  }

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Business: {business.businessName}</h1>
      <p className="mt-4 text-gray-700">Manage details for your business.</p>

      <div className="mt-8 max-w-2xl">
        <form action={updateFormAction} className="space-y-6">
          {/* Owner's Name */}
          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
              Owner&#39;s Name
            </label>
            <input
              id="ownerName"
              name="ownerName"
              type="text"
              defaultValue={business.ownerName}
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
              defaultValue={business.percentOwnership}
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
              defaultValue={business.businessName}
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
              defaultValue={business.businessType}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
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
              defaultValue={business.businessTaxStatus}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
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
              defaultValue={business.businessDescription || ''}
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
              defaultValue={business.businessIndustry}
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
              defaultValue={business.address || ''}
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
              defaultValue={business.phone || ''}
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
              defaultValue={business.website || ''}
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
            {business.businessMaterialsUrl && (
              <p className="mt-2 text-sm text-gray-500">
                Current materials: <a href={business.businessMaterialsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">View</a>
              </p>
            )}
          </div>

          {updateState?.message && (
            <p className="text-sm text-green-600">{updateState.message}</p>
          )}
          {updateState?.error && (
            <p className="text-sm text-red-600">{updateState.error}</p>
          )}

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Update Business Profile
            </button>

            {!business.isArchived && (
              <button
                type="button"
                onClick={() => archiveAction(business.id)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Archive Business
              </button>
            )}
            {business.isArchived && (
              <p className="text-sm text-gray-500">This business is archived.</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

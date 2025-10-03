import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { getBusinessProfile, updateBusinessProfile, archiveBusiness } from "../../actions";
import { Business } from "@/db/schema";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";

type FormState = {
  message: string;
  error: string;
} | undefined;

interface EditBusinessProfilePageProps {
  params: { businessId: string };
}

export default function EditBusinessProfilePage({ params }: EditBusinessProfilePageProps) {
  const router = useRouter();
  const businessId = parseInt(params.businessId);

  if (isNaN(businessId)) {
    notFound();
  }

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusiness() {
      const fetchedBusiness = await getBusinessProfile(businessId);
      if (fetchedBusiness) {
        setBusiness(fetchedBusiness);
      } else {
        notFound();
      }
      setLoading(false);
    }
    fetchBusiness();
  }, [businessId]);

  const [editState, formAction] = useFormState<FormState, FormData>(
    updateBusinessProfile.bind(null, businessId),
    undefined
  );

  // Handle successful update
  useEffect(() => {
    if (editState?.message && !editState.error) {
      // Re-fetch business data to show updated values
      async function reFetchBusiness() {
        const reFetchedBusiness = await getBusinessProfile(businessId);
        if (reFetchedBusiness) {
          setBusiness(reFetchedBusiness);
        }
      }
      reFetchBusiness();
    }
  }, [editState, businessId]);

  const handleArchive = async () => {
    if (window.confirm("Are you sure you want to archive this business? This action cannot be undone.")) {
      const result = await archiveBusiness(businessId);
      if (result?.message && !result.error) {
        router.push("/dashboard/businesses"); // Redirect to business list after archiving
      } else if (result?.error) {
        alert(`Failed to archive business: ${result.error}`);
      }
    }
  };

  if (loading) {
    return <div className="flex-1 p-6 text-center text-gray-500">Loading business profile...</div>;
  }

  if (!business) {
    return <div className="flex-1 p-6 text-center text-red-500">Business not found.</div>;
  }

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit {business.businessName} Profile</h1>
      <div className="mt-8">
        <form action={formAction} className="space-y-6 mt-4">
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

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
              defaultValue={business.percentOwnership}
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
              defaultValue={business.businessType}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            >
              <option value="S-Corporation">S-Corporation</option>
              <option value="C-Corporation">C-Corporation</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* NAICS Code */}
          <div>
            <label htmlFor="naicsCode" className="block text-sm font-medium text-gray-700">
              NAICS Code
            </label>
            <input
              id="naicsCode"
              name="naicsCode"
              type="text"
              defaultValue={business.naicsCode || ''}
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
              defaultValue={business.streetAddress || ''}
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
              defaultValue={business.city || ''}
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
              defaultValue={business.state || ''}
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
              defaultValue={business.zipCode || ''}
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
              defaultValue={business.phone || ''}
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
              defaultValue={business.website || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* Business Materials Upload (Placeholder) */}
          <div>
            <label htmlFor="businessMaterials" className="block text-sm font-medium text-gray-700">
              Business Materials (Current: {business.businessMaterialsUrl || 'None'})
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

          {/* Business Logo Upload */}
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
              Business Logo (Current: {business.logoUrl || 'None'})
            </label>
            <input
              id="logo"
              name="logo"
              type="file"
              className="mt-1 block w-full text-sm text-gray-900
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-[#910000] file:text-white
                hover:file:bg-[#7a0000]"
            />
          </div>

          {editState?.message && (
            <p className="text-sm text-green-600">{editState.message}</p>
          )}
          {editState?.error && (
            <p className="text-sm text-red-600">{editState.error}</p>
          )}

          <div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Update Business Profile
            </button>
          </div>
        </form>

        {/* Archive Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleArchive}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Archive Business
          </button>
        </div>
      </div>
    </div>
  );
}

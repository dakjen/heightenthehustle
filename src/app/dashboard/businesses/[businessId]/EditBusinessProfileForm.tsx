'use client';

import { useState } from "react";
import { Business, BusinessWithDemographic } from "@/db/schema";
import { updateBusinessProfile } from "../actions";
import { useFormState } from "react-dom";
import Image from "next/image";

interface Demographic {
  id: number;
  name: string;
}

type FormState = {
  message: string;
  error: string;
} | undefined;

interface EditBusinessProfileFormProps {
  initialBusiness: BusinessWithDemographic;
  availableDemographics: Demographic[];
}

export default function EditBusinessProfileForm({ initialBusiness, availableDemographics }: EditBusinessProfileFormProps) {
  const [business, setBusiness] = useState<BusinessWithDemographic>(initialBusiness);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logoUrl);

  const [editState, editFormAction] = useFormState<FormState, FormData>(updateBusinessProfile, undefined);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (business.logoUrl && !confirm("Are you sure you want to override your current logo?")) {
        e.target.value = ''; // Clear the input if user cancels
        setLogoFile(null);
        setLogoPreview(business.logoUrl);
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoFile(null);
      setLogoPreview(business.logoUrl);
    }
  };

  return (
    <form action={editFormAction} className="space-y-6">
      <input type="hidden" name="businessId" value={business.id} />
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

      {/* Owner Name */}
      <div>
        <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
          Owner Name
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
          defaultValue={business.businessTaxStatus}
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
          defaultValue={business.businessDescription || ''}
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
          defaultValue={business.businessIndustry}
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

      {/* Business Logo Upload */}
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
          Business Logo
        </label>
        <div className="mt-2">
          <input
            id="logo"
            name="logo"
            type="file"
            onChange={handleLogoChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>
        {logoPreview && (
          <div className="mt-4">
            <Image src={logoPreview} alt="Logo Preview" width={96} height={96} className="rounded-md object-cover" />
          </div>
        )}
      </div>

      {/* Business Profile Photo Upload */}
      <div>
        <label htmlFor="businessProfilePhoto" className="block text-sm font-medium text-gray-700">
          Business Profile Photo
        </label>
        <div className="mt-2">
          <input
            id="businessProfilePhoto"
            name="businessProfilePhoto"
            type="file"
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>
      </div>

      {editState?.message && (
        <p className="text-sm text-green-600 mt-2">{editState.message}</p>
      )}
      {editState?.error && (
        <p className="text-sm text-red-600 mt-2">{editState.error}</p>
      )}

      <div className="mt-6">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Business } from "@/db/schema";
import { updateBusinessProfile } from "../actions"; // Will create this action
import { useFormState } from "react-dom";

type FormState = {
  message: string;
  error: string;
} | undefined;

interface EditBusinessProfileFormProps {
  initialBusiness: Business;
}

export default function EditBusinessProfileForm({ initialBusiness }: EditBusinessProfileFormProps) {
  const [business, setBusiness] = useState<Business>(initialBusiness);

  const [editState, editFormAction] = useFormState<FormState, FormData>(updateBusinessProfile.bind(null, business.id), undefined);

  return (
    <form action={editFormAction} className="space-y-6">
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

      {/* Business Materials Upload */}
      <div>
        <label htmlFor="businessMaterials" className="block text-sm font-medium text-gray-700">
          Business Materials URL
        </label>
        <input
          id="businessMaterials"
          name="businessMaterials"
          type="text"
          defaultValue={business.businessMaterialsUrl || ''}
          className="mt-1 block w-full text-sm text-gray-900
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-[#910000] file:text-white
            hover:file:bg-[#7a0000]"
        />
      </div>

      {/* Logo URL */}
      <div>
        <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
          Logo URL
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="text"
          defaultValue={business.logoUrl || ''}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
        />
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

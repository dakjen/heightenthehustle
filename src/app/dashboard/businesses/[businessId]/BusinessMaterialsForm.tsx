'use client';

import { useState } from "react";
import { Business, BusinessWithDemographic } from "@/db/schema";
import { updateBusinessProfile } from "../actions";
import { useFormState } from "react-dom";

type FormState = {
  message: string;
  error: string;
} | undefined;

interface BusinessMaterialsFormProps {
  initialBusiness: BusinessWithMaterials;
}

type MaterialProperties = {
  [K in `material${1 | 2 | 3 | 4 | 5}Url` | `material${1 | 2 | 3 | 4 | 5}Title`]: string | null | undefined;
};

type BusinessWithMaterials = BusinessWithDemographic & MaterialProperties;

export default function BusinessMaterialsForm({ initialBusiness }: BusinessMaterialsFormProps) {
  const [business, setBusiness] = useState<BusinessWithMaterials>(initialBusiness);
  const [editState, editFormAction] = useFormState<FormState, FormData>(updateBusinessProfile, undefined);

  return (
    <form action={editFormAction} className="space-y-6">
      <input type="hidden" name="businessId" value={business.id} />

      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="sm:col-span-full">
          <label htmlFor={`material${i}Title`} className="block text-sm font-medium leading-6 text-gray-900">
            Material {i} Title
          </label>
          <div className="mt-2">
            <input
              type="text"
              name={`material${i}Title`}
              id={`material${i}Title`}
              defaultValue={business[`material${i}Title` as `material${1 | 2 | 3 | 4 | 5}Title`] || ''}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <label htmlFor={`material${i}`} className="block text-sm font-medium leading-6 text-gray-900 mt-4">
            Material {i} Document
          </label>
          <div className="mt-2">
            <input
              id={`material${i}`}
              name={`material${i}`}
              type="file"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {business[`material${i}Url` as `material${1 | 2 | 3 | 4 | 5}Url`] && (
              <p className="mt-2 text-sm text-gray-500">
                Current: <a href={business[`material${i}Url` as `material${1 | 2 | 3 | 4 | 5}Url`] as string} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Document</a>
              </p>
            )}
          </div>
        </div>
      ))}

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

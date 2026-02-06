'use client';

import { BusinessWithLocation } from "@/db/schema";
import { useActionState } from "react";
import { updateBusinessMaterials } from "../actions";

import { FormState } from "@/types/form-state";

interface BusinessDocumentsProps {
  business: BusinessWithLocation;
}

export default function BusinessDocuments({ business }: BusinessDocumentsProps) {
  const [updateState, updateFormAction] = useActionState<FormState, FormData>(updateBusinessMaterials, { message: "" });

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">Business Documents</h2>
      <form action={updateFormAction} className="space-y-6 mt-4">
        <input type="hidden" name="businessId" value={business.id} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <label htmlFor={`material${i}Title`} className="block text-sm font-medium text-gray-700">
              Document {i} Title
            </label>
            <input
              id={`material${i}Title`}
              name={`material${i}Title`}
              type="text"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              defaultValue={(business as any)[`material${i}Title`] || ''}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            />
            <label htmlFor={`material${i}`} className="block text-sm font-medium text-gray-700 mt-2">
              Document {i} File
            </label>
            <input
              id={`material${i}`}
              name={`material${i}`}
              type="file"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(business as any)[`material${i}Url`] && (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <a href={(business as any)[`material${i}Url`]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                View Current Document {i}
              </a>
            )}
          </div>
        ))}

        {updateState?.message && (
          <p className="text-sm text-green-600 mt-2">{updateState.message}</p>
        )}
        {updateState?.error && (
          <p className="text-sm text-red-600 mt-2">{updateState.error}</p>
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
    </div>
  );
}

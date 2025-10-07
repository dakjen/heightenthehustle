'use client';

import { useState, useEffect } from "react";
import { BusinessWithDemographic, Demographic, locations } from "@/db/schema";
import { updateBusinessDemographics } from "../actions";
import { useFormState } from "react-dom";
import { getAvailableLocations } from "../../messages/actions";

type FormState = {
  message: string;
  error: string;
} | undefined;

interface BusinessDetailsFormProps {
  initialBusiness: BusinessWithDemographic;
  availableDemographics: Demographic[];
}

export default function BusinessDetailsForm({ initialBusiness, availableDemographics }: BusinessDetailsFormProps) {
  const [demographicId, setDemographicId] = useState(initialBusiness.demographicId || "");
  const [locationId, setLocationId] = useState(initialBusiness.locationId || "");
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLocations() {
      const locations = await getAvailableLocations();
      setAvailableLocations(locations);
    }
    fetchLocations();
  }, []);

  const [updateState, updateFormAction] = useFormState<FormState, FormData>(updateBusinessDemographics, undefined);

  return (
    <form action={updateFormAction}>
      <h2 className="text-2xl font-bold">Owner Details</h2>
      <input type="hidden" name="businessId" value={initialBusiness.id} />
      <div>
        <label htmlFor="demographicId" className="block text-sm font-medium text-gray-700">
          Demographic
        </label>
        <select
          id="demographicId"
          name="demographicId"
          value={demographicId}
          onChange={(e) => setDemographicId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
        >
          <option value="">Select Demographic</option>
          {availableDemographics.map(demographic => (
            <option key={demographic.id} value={demographic.id}>
              {demographic.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <select
          id="locationId"
          name="locationId"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
        >
          <option value="">Select Location</option>
          {availableLocations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

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
  );
}

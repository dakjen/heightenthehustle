'use client';

import { useState, useEffect } from "react";
import { BusinessWithDemographic, Demographic, locations, BusinessWithLocation } from "@/db/schema";
import { updateBusinessDemographics } from "../actions";
import { useFormState } from "react-dom";
import { getAvailableLocations } from "../../messages/actions";
import { type InferSelectModel } from 'drizzle-orm';

type Location = InferSelectModel<typeof locations>;

type FormState = {
  message: string;
  error: string;
} | undefined;

interface BusinessDetailsFormProps {
  initialBusiness: BusinessWithLocation;
  availableDemographics: Demographic[];
}

export default function BusinessDetailsForm({ initialBusiness, availableDemographics }: BusinessDetailsFormProps) {
  const [selectedDemographicIds, setSelectedDemographicIds] = useState<number[]>(initialBusiness.demographicIds || []);
  const [selectedLocationId, setSelectedLocationId] = useState<number | "">(initialBusiness.locationId || "");
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);

  useEffect(() => {
    async function fetchLocations() {
      const locations = await getAvailableLocations();
      setAvailableLocations(locations);
    }
    fetchLocations();
  }, []);

  const [updateState, updateFormAction] = useFormState<FormState, FormData>(updateBusinessDemographics, undefined);

  const genderDemographics = availableDemographics.filter(d => d.category === 'Gender');
  const raceDemographics = availableDemographics.filter(d => d.category === 'Race');
  const religionDemographics = availableDemographics.filter(d => d.category === 'Religion');
  const cityLocations = availableLocations.filter(l => l.category === 'City');
  const regionLocations = availableLocations.filter(l => l.category === 'Region');

  const handleDemographicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.options);
    const selected = options.filter(option => option.selected).map(option => parseInt(option.value));
    setSelectedDemographicIds(selected);
  };

  return (
    <form action={updateFormAction}>
      <h2 className="text-2xl font-bold">Owner Details</h2>
      <input type="hidden" name="businessId" value={initialBusiness.id} />
      <input type="hidden" name="selectedDemographicIds" value={JSON.stringify(selectedDemographicIds)} />

      <div className="mt-4">
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          Gender
        </label>
        <select
          id="gender"
          name="genderDemographicIds"
          multiple
          value={selectedDemographicIds.filter(id => genderDemographics.some(d => d.id === id)).map(String)}
          onChange={handleDemographicChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
        >
          <option value="">Select Gender</option>
          {genderDemographics.map(demographic => (
            <option key={demographic.id} value={demographic.id}>
              {demographic.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="race" className="block text-sm font-medium text-gray-700">
          Race
        </label>
        <select
          id="race"
          name="raceDemographicIds"
          multiple
          value={selectedDemographicIds.filter(id => raceDemographics.some(d => d.id === id)).map(String)}
          onChange={handleDemographicChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
        >
          <option value="">Select Race</option>
          {raceDemographics.map(demographic => (
            <option key={demographic.id} value={demographic.id}>
              {demographic.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="religion" className="block text-sm font-medium text-gray-700">
          Religion
        </label>
        <select
          id="religion"
          name="religionDemographicIds"
          multiple
          value={selectedDemographicIds.filter(id => religionDemographics.some(d => d.id === id)).map(String)}
          onChange={handleDemographicChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
        >
          <option value="">Select Religion</option>
          {religionDemographics.map(demographic => (
            <option key={demographic.id} value={demographic.id}>
              {demographic.name}
            </option>
          ))}
        </select>
      </div>

      <h2 className="text-2xl font-bold mt-8">Business Details</h2>

      <div className="mt-4">
        <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">
          Location (City)
        </label>
        <select
          id="locationId"
          name="locationId"
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
        >
          <option value="">Select City</option>
          {cityLocations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="regionId" className="block text-sm font-medium text-gray-700">
          Location (Region)
        </label>
        <select
          id="regionId"
          name="regionId"
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
        >
          <option value="">Select Region</option>
          {regionLocations.map(location => (
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

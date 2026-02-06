'use client';

import { useState, useEffect, useRef } from "react";
import { Demographic, BusinessWithLocation, Location } from "@/db/schema";
import { updateBusinessDemographics } from "../actions";
import { useActionState } from "react";

import { FormState } from "@/types/form-state";

interface BusinessDetailsFormProps {
  initialBusiness: BusinessWithLocation;
  availableDemographics: Demographic[];
  availableLocations: Location[];
  onBusinessUpdate?: () => Promise<void>; // Made optional
}

export default function BusinessDetailsForm({ initialBusiness, availableDemographics, availableLocations, onBusinessUpdate }: BusinessDetailsFormProps) {
  console.log('BusinessDetailsForm: availableDemographics (client)', JSON.stringify(availableDemographics, null, 2));
  console.log('BusinessDetailsForm: initialBusiness (client)', JSON.stringify(initialBusiness, null, 2));
  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Initialize state for single selections
  const [selectedGenderId, setSelectedGenderId] = useState<number | "">("");
  const [selectedRaceId, setSelectedRaceId] = useState<number | "">("");
  const [selectedReligionId, setSelectedReligionId] = useState<number | "">("");
  const [selectedStateLocationId, setSelectedStateLocationId] = useState<number | "">("");
  const [selectedRegionLocationId, setSelectedRegionLocationId] = useState<number | "">("");
  const [isTransgender, setIsTransgender] = useState<boolean>(false);
  const [city, setCity] = useState(initialBusiness.city || '');

  const [updateState, updateFormAction] = useActionState<FormState, FormData>(updateBusinessDemographics, { message: "" });
  const lastHandledUpdateState = useRef(updateState);

  const genderDemographics = availableDemographics.filter(d => d.category === 'Gender' && d.name !== 'Transgender');
  const raceDemographics = availableDemographics.filter(d => d.category === 'Race');
  const religionDemographics = availableDemographics.filter(d => d.category === 'Religion');

  useEffect(() => {
    console.log('BusinessDetailsForm: useEffect triggered. initialBusiness (client):', JSON.stringify(initialBusiness, null, 2));
    console.log('BusinessDetailsForm: availableDemographics (client) inside useEffect:', JSON.stringify(availableDemographics, null, 2));

    const currentDemographicIds = initialBusiness.demographicIds || [];

    const transgenderDemographic = availableDemographics.find(d => d.name === 'Transgender' && d.category === 'Gender');

    const transgenderId = transgenderDemographic?.id;

    // Filter out Transgender ID from the general gender selection
    const genderDemographicsForDropdown = availableDemographics.filter(d =>
      d.category === 'Gender' && d.id !== transgenderId
    );

    const currentGenderId = currentDemographicIds.find(id =>
      genderDemographicsForDropdown.some(d => d.id === id)
    ) || "";
    setSelectedGenderId(currentGenderId);

    const currentRaceId = currentDemographicIds.find(id => availableDemographics.find(d => d.id === id)?.category === 'Race') || "";
    setSelectedRaceId(currentRaceId);
    const currentReligionId = currentDemographicIds.find(id => availableDemographics.find(d => d.id === id)?.category === 'Religion') || "";
    setSelectedReligionId(currentReligionId);
    setSelectedStateLocationId(initialBusiness.stateLocation?.id || "");
    setSelectedRegionLocationId(initialBusiness.regionLocation?.id || "");
    setCity(initialBusiness.city || '');

    const currentIsTransgender = (transgenderId && currentDemographicIds.includes(transgenderId)) || false;
    setIsTransgender(currentIsTransgender);

  }, [initialBusiness, availableDemographics, availableLocations]); // Added availableLocations to dependencies

  // Trigger onBusinessUpdate after a successful save
  useEffect(() => {
    if (updateState === lastHandledUpdateState.current) return;
    lastHandledUpdateState.current = updateState;
    if (updateState?.message && !updateState.error) {
      setIsEditing(false);
      if (onBusinessUpdate) {
        onBusinessUpdate();
      }
    }
  }, [updateState, onBusinessUpdate]);

  // Combine selected demographic IDs for submission
  const combinedDemographicIds = [selectedGenderId, selectedRaceId, selectedReligionId]
    .filter((id): id is number => typeof id === 'number');

  // Add Transgender ID if checked
  if (isTransgender) {
    const transgenderDemographic = availableDemographics.find(d => d.name === 'Transgender');
    if (transgenderDemographic) {
      combinedDemographicIds.push(transgenderDemographic.id);
    }
  }

  const handleTransgenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTransgender(e.target.checked);
  };

  const updateFormActionWithLog = (formData: FormData) => {
    updateFormAction(formData);
    console.log('BusinessDetailsForm: updateState after formAction:', updateState);
  };

  return (
    <form action={updateFormActionWithLog}>
      <h2 className="text-2xl font-bold">Owner Details</h2>
      <input type="hidden" name="businessId" value={initialBusiness.id} />
      <input type="hidden" name="isTransgender" value={isTransgender.toString()} />

      <div className="mt-4">
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          value={selectedGenderId}
          onChange={(e) => setSelectedGenderId(parseInt(e.target.value) || "")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          disabled={!isEditing}
        >
          <option value="">Select Gender</option>
          {genderDemographics.map(demographic => (
            <option key={demographic.id} value={demographic.id}>
              {demographic.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex items-center space-x-4">
        {/* Transgender Checkbox */}
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="isTransgender"
            checked={isTransgender}
            onChange={handleTransgenderChange}
            className="form-checkbox h-5 w-5 text-[#910000]"
            disabled={!isEditing}
          />
          <span className="ml-2 text-gray-700">Transgender</span>
        </label>
      </div>

      <div className="mt-4">
        <label htmlFor="race" className="block text-sm font-medium text-gray-700">
          Race
        </label>
        <select
          id="race"
          name="race"
          value={selectedRaceId}
          onChange={(e) => setSelectedRaceId(parseInt(e.target.value) || "")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          disabled={!isEditing}
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
          name="religion"
          value={selectedReligionId}
          onChange={(e) => setSelectedReligionId(parseInt(e.target.value) || "")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          disabled={!isEditing}
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
        <label htmlFor="stateLocationId" className="block text-sm font-medium text-gray-700">
          Location (State)
        </label>
        <select
          id="stateLocationId"
          name="stateLocationId"
          value={selectedStateLocationId}
          onChange={(e) => setSelectedStateLocationId(parseInt(e.target.value) || "")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          disabled={!isEditing}
        >
          <option value="">Select State</option>
          {availableLocations.filter(l => l.category === 'State').map(location => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          City
        </label>
        <input
          id="city"
          name="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          disabled={!isEditing}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="regionLocationId" className="block text-sm font-medium text-gray-700">
          Location (Region)
        </label>
        <select
          id="regionLocationId"
          name="regionLocationId"
          value={selectedRegionLocationId}
          onChange={(e) => setSelectedRegionLocationId(parseInt(e.target.value) || "")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          disabled={!isEditing}
        >
          <option value="">Select Region</option>
          {availableLocations.filter(l => l.category === 'Region').map(location => (
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

      <div className="mt-6 flex justify-end space-x-3">
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit Details
          </button>
        )}
        {isEditing && (
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        )}
      </div>
    </form>
  );
}

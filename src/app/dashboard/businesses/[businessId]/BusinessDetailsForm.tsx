'use client';

import { useState, useEffect } from "react";
import { Demographic, BusinessWithLocation, Location } from "@/db/schema";
import { updateBusinessDemographics } from "../actions";
import { useFormState } from "react-dom";

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
  const [isCisgender, setIsCisgender] = useState<boolean>(false);

  const [updateState, updateFormAction] = useFormState<FormState, FormData>(updateBusinessDemographics, { message: "" });

  const genderDemographics = availableDemographics.filter(d => d.category === 'Gender');
  const raceDemographics = availableDemographics.filter(d => d.category === 'Race');
  const religionDemographics = availableDemographics.filter(d => d.category === 'Religion');
  const cityLocations = availableLocations.filter(l => l.category === 'City');
  const regionLocations = availableLocations.filter(l => l.category === 'Region');

  useEffect(() => {
    console.log('BusinessDetailsForm: useEffect triggered. initialBusiness (client):', JSON.stringify(initialBusiness, null, 2));
    console.log('BusinessDetailsForm: availableDemographics (client) inside useEffect:', JSON.stringify(availableDemographics, null, 2));

    const currentDemographicIds = initialBusiness.demographicIds || [];

    const transgenderDemographic = availableDemographics.find(d => d.category === 'Transgender');
    const cisgenderDemographic = availableDemographics.find(d => d.category === 'Cisgender');

    const transgenderId = transgenderDemographic?.id;
    const cisgenderId = cisgenderDemographic?.id;

    // Filter out Transgender and Cisgender IDs from the general gender selection
    const genderDemographicsForDropdown = availableDemographics.filter(d =>
      d.category === 'Gender' && d.id !== transgenderId && d.id !== cisgenderId
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

    const currentIsTransgender = (transgenderId && currentDemographicIds.includes(transgenderId)) || false;
    setIsTransgender(currentIsTransgender);
    const currentIsCisgender = (cisgenderId && currentDemographicIds.includes(cisgenderId)) || false;
    setIsCisgender(currentIsCisgender);

  }, [initialBusiness, availableDemographics]); // Removed updateState from dependencies

  // Trigger onBusinessUpdate after a successful save
  useEffect(() => {
    if (updateState?.message && !updateState.error) {
      setIsEditing(false);
      if (onBusinessUpdate) { // Conditional check
        onBusinessUpdate(); // Call the parent's update function
      }
    }
  }, [updateState, onBusinessUpdate]);

  // Combine selected demographic IDs for submission
  const combinedDemographicIds = [selectedGenderId, selectedRaceId, selectedReligionId]
    .filter((id): id is number => typeof id === 'number');

  // Add Transgender ID if checked and not Cisgender
  if (isTransgender) {
    const transgenderDemographic = availableDemographics.find(d => d.name === 'Transgender');
    if (transgenderDemographic) {
      combinedDemographicIds.push(transgenderDemographic.id);
    }
  }

  // Add Cisgender ID if checked and not Transgender
  if (isCisgender) {
    const cisgenderDemographic = availableDemographics.find(d => d.name === 'Cisgender');
    if (cisgenderDemographic) {
      combinedDemographicIds.push(cisgenderDemographic.id);
    }
  }

  const handleTransgenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTransgender(e.target.checked);
    if (e.target.checked) {
      setIsCisgender(false); // Uncheck Cisgender if Transgender is checked
    }
  };

  const handleCisgenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCisgender(e.target.checked);
    if (e.target.checked) {
      setIsTransgender(false); // Uncheck Transgender if Cisgender is checked
    }
  };

  const updateFormActionWithLog = (formData: FormData) => {
    updateFormAction(formData);
  };

  return (
    <form action={updateFormActionWithLog}>
      <h2 className="text-2xl font-bold">Owner Details</h2>
      <input type="hidden" name="businessId" value={initialBusiness.id} />
      <input type="hidden" name="isTransgender" value={isTransgender.toString()} />
      <input type="hidden" name="isCisgender" value={isCisgender.toString()} />

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

        {/* Cisgender Checkbox */}
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="isCisgender"
            checked={isCisgender}
            onChange={handleCisgenderChange}
            className="form-checkbox h-5 w-5 text-[#910000]"
            disabled={!isEditing}
          />
          <span className="ml-2 text-gray-700">Cisgender</span>
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
          defaultValue={initialBusiness.city || ''}
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

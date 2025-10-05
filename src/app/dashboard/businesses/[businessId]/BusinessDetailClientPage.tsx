"use client";

import { useState, useEffect } from "react";
import { getBusinessProfile } from "../actions";
import { Business } from "@/db/schema";
import Image from "next/image";
import Link from "next/link";

interface BusinessDetailClientPageProps {
  initialBusiness: Business;
}

export default function BusinessDetailClientPage({ initialBusiness }: BusinessDetailClientPageProps) {
  console.log('BusinessDetailClientPage rendered');
  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [selectedLocation, setSelectedLocation] = useState(''); // New state for location

  // In a real application, you might re-fetch business data if it can change
  // useEffect(() => {
  //   async function reFetchBusiness() {
  //     const reFetchedBusiness = await getBusinessProfile(business.id);
  //     if (reFetchedBusiness) {
  //       setBusiness(reFetchedBusiness);
  //     }
  //   }
  //   reFetchBusiness();
  // }, [business.id]);

  const [activeTab, setActiveTab] = useState('business-profile');

  return (
    <div className="flex-1 p-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('business-profile')}
            className={`${activeTab === 'business-profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Business Profile
          </button>
          <button
            onClick={() => setActiveTab('business-details')}
            className={`${activeTab === 'business-details' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Business Details
          </button>
          <button
            onClick={() => setActiveTab('business-materials')}
            className={`${activeTab === 'business-materials' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Business Materials
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`${activeTab === 'branding' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Branding
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`${activeTab === 'edit' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Edit
          </button>
        </nav>
      </div>

      {activeTab === 'business-profile' && (
        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900">{business.businessName}</h1>
          {/* Business Logo Display */}
          <div className="mb-6 flex justify-center">
            {business.logoUrl ? (
              <Image src={business.logoUrl} alt="Business Logo" width={96} height={96} className="rounded-md object-cover border-2 border-gray-300" />
            ) : (
              <div className="h-24 w-24 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold border-2 border-gray-300">
                {business.businessName ? business.businessName[0].toUpperCase() : '?'}
              </div>
            )}
          </div>
          <p className="mt-4 text-gray-700">Owner: {business.ownerName}</p>
          <p className="mt-2 text-gray-700">Type: {business.businessType}</p>
          <p className="mt-2 text-gray-700">Tax Status: {business.businessTaxStatus}</p>
          <p className="mt-2 text-gray-700">Industry: {business.businessIndustry}</p>
          {business.businessDescription && <p className="mt-2 text-gray-700">Description: {business.businessDescription}</p>}
          {business.streetAddress && <p className="mt-2 text-gray-700">Address: {business.streetAddress}, {business.city}, {business.state} {business.zipCode}</p>}
          {business.phone && <p className="mt-2 text-gray-700">Phone: {business.phone}</p>}
          {business.website && <p className="mt-2 text-gray-700">Website: <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{business.website}</a></p>}
        </div>
      )}

      {activeTab === 'business-details' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">Business Details Content</h2>
          <p className="mt-2 text-gray-700">This section will contain additional business details.</p>
          <div className="mt-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <select
              id="location"
              name="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            >
              <option value="">Select Location</option>
              <option value="North East">North East</option>
              <option value="DMV">DMV</option>
              <option value="South">South</option>
              <option value="Southwest">Southwest</option>
              <option value="West">West</option>
              <option value="Northwest">Northwest</option>
              <option value="MidWest">MidWest</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* The Owner Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-xl font-bold text-gray-900 mb-4">The Owner</h3>

            {/* Race Dropdown */}
            <div className="mt-4">
              <label htmlFor="ownerRace" className="block text-sm font-medium text-gray-700">
                Race
              </label>
              <select
                id="ownerRace"
                name="ownerRace"
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              >
                <option value="">Select Race</option>
                <option value="American Indian or Alaska Native">American Indian or Alaska Native</option>
                <option value="Asian">Asian</option>
                <option value="Black or African American">Black or African American</option>
                <option value="Native Hawaiian or Pacific Islander">Native Hawaiian or Pacific Islander</option>
                <option value="White">White</option>
                <option value="More Than One Race">More Than One Race</option>
                <option value="Prefer Not To Say">Prefer Not To Say</option>
              </select>
            </div>

            {/* Gender Dropdown */}
            <div className="mt-4">
              <label htmlFor="ownerGender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="ownerGender"
                name="ownerGender"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer Not To Say">Prefer Not To Say</option>
              </select>
            </div>

            {/* Other Details Textbox */}
            <div className="mt-4">
              <label htmlFor="ownerOtherDetails" className="block text-sm font-medium text-gray-700">
                Other Details
              </label>
              <textarea
                id="ownerOtherDetails"
                name="ownerOtherDetails"
                rows={3}
                value={otherDetails}
                onChange={(e) => setOtherDetails(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              ></textarea>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'business-materials' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">Business Materials</h2>
          <p className="mt-2 text-gray-700">This section will contain the business materials.</p>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">Branding</h2>
          <p className="mt-2 text-gray-700">This section will contain the branding information.</p>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="mt-8">
          <Link href={`/dashboard/businesses/${business.id}/edit`}>
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Edit Business Profile
            </button>
          </Link>
        </div>
      )}
    </div>
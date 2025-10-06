"use client";

import { useState, useEffect } from "react";
import { getBusinessProfile } from "../actions"; // Import getBusinessProfile
import { businesses, businessesRelations, Business, Demographic, BusinessWithDemographic } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import Image from "next/image";
import EditBusinessProfileForm from "./EditBusinessProfileForm";
import BusinessMaterialsForm from "./BusinessMaterialsForm";

// Remove this line as BusinessProfileWithDemographic is now imported
// type BusinessWithDemographic = Business & { demographic?: Demographic | null };

// Remove this local interface as it's now imported from schema.ts
// interface Demographic {
//   id: number;
//   name: string;
// }

interface BusinessDetailClientPageProps {
  initialBusiness: BusinessWithDemographic; // Use the imported type
  availableDemographics: Demographic[];
}

export default function BusinessDetailClientPage({ initialBusiness, availableDemographics }: BusinessDetailClientPageProps) {
  const [business, setBusiness] = useState<BusinessWithDemographic>(initialBusiness); // Use the imported type
  const [selectedLocation, setSelectedLocation] = useState(''); // New state for location
  const [selectedRace, setSelectedRace] = useState(''); // New state for race
  const [selectedGender, setSelectedGender] = useState(''); // New state for gender
  const [otherDetails, setOtherDetails] = useState(''); // New state for other details

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
          {/* Display Demographic Information */}
          {business.demographic && (
            <div className="mt-4">
              <p className="block text-sm font-medium text-gray-700">Demographic:</p>
              <p className="mt-1 text-gray-900">{business.demographic.name}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'business-materials' && (
        <div className="mt-8">
          <BusinessMaterialsForm initialBusiness={business} />
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
          <EditBusinessProfileForm initialBusiness={business} availableDemographics={availableDemographics} />
        </div>
      )}
    </div>
  );
}
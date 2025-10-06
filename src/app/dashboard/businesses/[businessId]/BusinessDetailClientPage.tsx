"use client";

import { useState, useEffect } from "react";
import { getBusinessProfile } from "../actions"; // Import getBusinessProfile
import { businesses, businessesRelations, Business, Demographic, BusinessWithDemographic } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import Image from "next/image";
import EditBusinessProfileForm from "./EditBusinessProfileForm";
import OwnerDetailsForm from "./OwnerDetailsForm";



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
            onClick={() => setActiveTab('owner-details')}
            className={`${activeTab === 'owner-details' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Owner Details
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`${activeTab === 'edit' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Edit
          </button>
        </nav>
      </div>

  return (
    <div className="flex-1 p-6">
      {activeTab === 'business-profile' && (
        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900">{business.businessName}</h1>
          <div className="mb-6 flex justify-center">
            {business.logoUrl ? (
              <Image src={business.logoUrl} alt="Business Logo" width={96} height={96} className="rounded-md object-cover border-2 border-gray-300" />
            ) : (
              <div className="h-24 w-24 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold border-2 border-gray-300">
                {business.businessName ? business.businessName[0].toUpperCase() : '?'}
              </div>
            )}
          </div>
          {business.businessProfilePhotoUrl && (
            <div className="mb-6 flex justify-center">
              <Image src={business.businessProfilePhotoUrl} alt="Business Profile Photo" width={96} height={96} className="rounded-full object-cover border-2 border-gray-300" />
            </div>
          )}
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

      {activeTab === 'owner-details' && (
        <div className="mt-8">
          <OwnerDetailsForm initialBusiness={business} availableDemographics={availableDemographics} />
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
}
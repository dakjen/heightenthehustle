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

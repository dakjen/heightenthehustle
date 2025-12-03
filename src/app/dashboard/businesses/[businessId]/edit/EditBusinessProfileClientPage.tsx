"use client";

import { useState } from "react";
import { Demographic, Location, BusinessWithLocation } from "@/db/schema";
import Link from "next/link";
import EditBusinessProfileForm from "../EditBusinessProfileForm";
import BusinessDetailsForm from "../BusinessDetailsForm";
import { getBusinessProfile } from "../../../businesses/actions"; // Import getBusinessProfile

interface EditBusinessProfileClientPageProps {
  initialBusiness: BusinessWithLocation;
  availableDemographics: Demographic[];
  availableLocations: Location[];
}

export default function EditBusinessProfileClientPage({ initialBusiness, availableDemographics, availableLocations }: EditBusinessProfileClientPageProps) {
  const [activeTab, setActiveTab] = useState("info"); // 'info', 'owner-details', 'materials', 'branding'
  const [business, setBusiness] = useState(initialBusiness); // Introduce state for business

  const handleBusinessUpdate = async () => {
    console.log('EditBusinessProfileClientPage: handleBusinessUpdate called for business ID:', business.id);
    console.log('EditBusinessProfileClientPage: business state BEFORE setBusiness:', JSON.stringify(business, null, 2));
    const updatedBusiness = await getBusinessProfile(business.id);
    if (updatedBusiness) {
      console.log('EditBusinessProfileClientPage: setBusiness with updatedBusiness:', JSON.stringify(updatedBusiness, null, 2));
      setBusiness(updatedBusiness);
      console.log('EditBusinessProfileClientPage: business state AFTER setBusiness (should be updated on next render):', JSON.stringify(updatedBusiness, null, 2));
    }
  };

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Business: {business.businessName}</h1>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabButton tabName="info" activeTab={activeTab} setActiveTab={setActiveTab}>Business Info</TabButton>
          <TabButton tabName="owner-details" activeTab={activeTab} setActiveTab={setActiveTab}>Owner Details</TabButton>
          <TabButton tabName="materials" activeTab={activeTab} setActiveTab={setActiveTab}>Business Materials</TabButton>
          <TabButton tabName="branding" activeTab={activeTab} setActiveTab={setActiveTab}>Branding</TabButton>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "info" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Information</h2>
            <EditBusinessProfileForm
              initialBusiness={business} // Pass local state
              availableDemographics={availableDemographics}
              availableLocations={availableLocations}
            />
          </div>
        )}
        {activeTab === "owner-details" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Owner Details</h2>
            <BusinessDetailsForm
              initialBusiness={business} // Pass local state
              availableDemographics={availableDemographics}
              availableLocations={availableLocations}
              onBusinessUpdate={handleBusinessUpdate} // Pass the update function
            />
          </div>
        )}
        {activeTab === "materials" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Materials</h2>
            {/* Placeholder for business materials management */}
            <p>Business materials management will go here.</p>
          </div>
        )}
        {activeTab === "branding" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Branding</h2>
            {/* Placeholder for branding elements */}
            <p>Branding elements (logo, colors, etc.) will go here.</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link href={`/dashboard/businesses/${business.id}`}>
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Back to Business Details
          </button>
        </Link>
      </div>
    </div>
  );
}

interface TabButtonProps {
  tabName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

function TabButton({ tabName, activeTab, setActiveTab, children }: TabButtonProps) {
  const isActive = activeTab === tabName;
  return (
    <button
      type="button"
      onClick={() => setActiveTab(tabName)}
      className={`${
        isActive
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
    >
      {children}
    </button>
  );
}


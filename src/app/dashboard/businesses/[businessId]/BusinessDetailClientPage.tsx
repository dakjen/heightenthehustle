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

  const [activeTab, setActiveTab] = useState('business-info');

  return (
    <div className="flex-1 p-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('business-info')}
            className={`${activeTab === 'business-info' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Business Info
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

      {activeTab === 'business-info' && (
        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900">{business.businessName}</h1>
          {/* Business Logo Display */}
          <div className="mb-6 flex justify-center">
            {business.logoUrl ? (
              <Image src={business.logoUrl} alt="Business Logo" width={96} height={96} className="rounded-full object-cover border-2 border-gray-300" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold border-2 border-gray-300">
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
  );
}
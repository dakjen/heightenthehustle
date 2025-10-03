"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { getBusinessProfile, updateBusinessProfile } from "../actions";
import { Business } from "@/db/schema"; // New import
import Image from "next/image";
import Link from "next/link"; // New import

type FormState = {
  message: string;
  error: string;
} | undefined;

interface BusinessDetailClientPageProps {
  initialBusiness: Business;
}

export default function BusinessDetailClientPage({ initialBusiness }: BusinessDetailClientPageProps) {
  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [editState, formAction] = useFormState<FormState, FormData>(
    updateBusinessProfile.bind(null, business.id),
    undefined
  );

  // Handle successful update
  useEffect(() => {
    if (editState?.message && !editState.error) {
      // Re-fetch business data to show updated values
      async function reFetchBusiness() {
        const reFetchedBusiness = await getBusinessProfile(business.id);
        if (reFetchedBusiness) {
          setBusiness(reFetchedBusiness);
        }
      }
      reFetchBusiness();
    }
  }, [editState, business.id]);

  return (
    <div className="flex-1 p-6">
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
      {/* Add more business details here */}

      {/* Edit Profile Button */}
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

      {/* Placeholder for Multi-level Business Progress Tracker */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-inner">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Progress Tracker</h2>
        <p className="text-gray-700">This section will contain the multi-level progress tracker with items to be checked off or uploaded, and a progress bar at the top.</p>
        {/* Progress Bar Component will go here */}
        {/* Level 1 Component will go here */}
        {/* Level 2 Component will go here */}
        {/* Level 3 Component will go here */}
        {/* Level 4 Component will go here */}
      </div>

      {/* Pending Requests Section - Keep this for now, can be integrated into levels later if needed */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
        <p className="mt-2 text-gray-700">This section will display requests to work with this business.</p>
        {/* Placeholder for pending requests list */}
        <ul className="mt-4 space-y-2">
          <li className="p-4 bg-gray-100 rounded-md">Request from User A - Pending</li>
          <li className="p-4 bg-gray-100 rounded-md">Request from User B - Pending</li>
        </ul>
      </div>
    </div>
  );
}

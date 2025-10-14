"use client";

import { useState } from "react";
import { downloadAllData } from "./actions";

// Define interfaces for the data structures from schema
interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'internal' | 'external';
  hasBusinessProfile: boolean;
  personalAddress: string | null;
  personalCity: string | null;
  personalState: string | null;
  personalZipCode: string | null;
  profilePhotoUrl: string | null;
}

interface Business {
    id: number;
    userId: number;
    businessName: string;
    ownerName: string;
    percentOwnership: string;
    businessType: "Sole Proprietorship" | "Partnership" | "Limited Liability Company (LLC)" | "Corporation";
    businessTaxStatus: "S-Corporation" | "C-Corporation" | "Not Applicable";
    businessDescription: string | null;
    businessIndustry: string;
    naicsCode: string | null;
    logoUrl: string | null;
    businessProfilePhotoUrl: string | null;
    businessMaterialsUrl: string | null;
    streetAddress: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    phone: string | null;
    website: string | null;
    isArchived: boolean;
    locationId: number | null;
    demographicIds: number[] | null;
    material1Url: string | null;
    material1Title: string | null;
    material2Url: string | null;
    material2Title: string | null;
    material3Url: string | null;
    material3Title: string | null;
    material4Url: string | null;
    material4Title: string | null;
    material5Url: string | null;
    material5Title: string | null;
}

interface BusinessData {
  business: Business;
  userEmail: string;
}

interface AllData {
  users: User[];
  businesses: BusinessData[];
}

// Function to escape CSV fields
const escapeCSV = (field: any): string => {
  if (field === null || field === undefined) {
    return '""';
  }
  const stringField = String(field);
  // Replace quotes with double quotes and wrap in quotes if it contains commas, quotes, or newlines
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return `"${stringField}"`;
};


// Function to convert array of objects to CSV
const convertToCSV = (data: AllData): string => {
  const { users, businesses } = data;

  // Create a map of userId to user details
  const userMap = new Map<number, User>();
  users.forEach(user => userMap.set(user.id, user));

  // Define CSV headers
  const userHeaders = [
    "User ID", "User Name", "User Email", "User Phone", "User Role",
    "Has Business Profile", "Personal Address", "Personal City",
    "Personal State", "Personal Zip Code", "Profile Photo URL"
  ];
  const businessHeaders = [
    "Business ID", "Business Name", "Owner Name", "Percent Ownership", "Business Type", "Business Tax Status",
    "Business Description", "Business Industry", "NAICS Code", "Logo URL", "Business Profile Photo URL",
    "Business Materials URL", "Street Address", "City", "State", "Zip Code", "Business Phone", "Website",
    "Is Archived", "Location ID", "Demographic IDs", "Material 1 URL", "Material 1 Title", "Material 2 URL",
    "Material 2 Title", "Material 3 URL", "Material 3 Title", "Material 4 URL", "Material 4 Title",
    "Material 5 URL", "Material 5 Title"
  ];
  const headers = [...userHeaders, ...businessHeaders];

  const rows = [];
  rows.push(headers.join(','));

  // Create a set of users who have businesses
  const usersWithBusinesses = new Set(businesses.map(b => b.business.userId));

  // Process users with businesses
  businesses.forEach(({ business }) => {
    const user = userMap.get(business.userId);
    if (user) {
      const userValues = [
        user.id, user.name, user.email, user.phone, user.role,
        user.hasBusinessProfile, user.personalAddress, user.personalCity,
        user.personalState, user.personalZipCode, user.profilePhotoUrl
      ].map(escapeCSV);

      const businessValues = [
        business.id, business.businessName, business.ownerName, business.percentOwnership, business.businessType,
        business.businessTaxStatus, business.businessDescription, business.businessIndustry, business.naicsCode,
        business.logoUrl, business.businessProfilePhotoUrl, business.businessMaterialsUrl, business.streetAddress,
        business.city, business.state, business.zipCode, business.phone, business.website, business.isArchived,
        business.locationId, business.demographicIds ? business.demographicIds.join(';') : '',
        business.material1Url, business.material1Title, business.material2Url, business.material2Title,
        business.material3Url, business.material3Title, business.material4Url, business.material4Title,
        business.material5Url, business.material5Title
      ].map(escapeCSV);

      rows.push([...userValues, ...businessValues].join(','));
    }
  });

  // Process users without businesses
  users.forEach(user => {
    if (!usersWithBusinesses.has(user.id)) {
      const userValues = [
        user.id, user.name, user.email, user.phone, user.role,
        user.hasBusinessProfile, user.personalAddress, user.personalCity,
        user.personalState, user.personalZipCode, user.profilePhotoUrl
      ].map(escapeCSV);
      // Pad with empty values for business columns
      const emptyBusinessValues = Array(businessHeaders.length).fill('""');
      rows.push([...userValues, ...emptyBusinessValues].join(','));
    }
  });


  return rows.join('\n');
};


export default function DownloadDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await downloadAllData();
      if (!data) {
        throw new Error("No data received");
      }
      const csvString = convertToCSV(data);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hth_data.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isLoading ? "Downloading..." : "Download All Data (CSV)"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
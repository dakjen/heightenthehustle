'use client';

import { useState } from "react";
import { downloadAllData } from "./actions";

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

const escapeCSV = (field: string | number | boolean | null | undefined): string => {
  if (field === null || field === undefined) {
    return '""';
  }
  const stringField = String(field);
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return `"${stringField}"`;
};

const convertToBusinessCSV = (businesses: BusinessData[]): string => {
  const headers = [
    "Business ID", "Business Name", "Owner Name", "User Email", "Percent Ownership", "Business Type", "Business Tax Status",
    "Business Description", "Business Industry", "NAICS Code", "Logo URL", "Business Profile Photo URL",
    "Business Materials URL", "Street Address", "City", "State", "Zip Code", "Business Phone", "Website",
    "Is Archived", "Location ID", "Demographic IDs", "Material 1 URL", "Material 1 Title", "Material 2 URL",
    "Material 2 Title", "Material 3 URL", "Material 3 Title", "Material 4 URL", "Material 4 Title",
    "Material 5 URL", "Material 5 Title"
  ];

  const rows = businesses.map(({ business, userEmail }) => {
    const businessValues = [
      business.id, business.businessName, business.ownerName, userEmail, business.percentOwnership, business.businessType,
      business.businessTaxStatus, business.businessDescription, business.businessIndustry, business.naicsCode,
      business.logoUrl, business.businessProfilePhotoUrl, business.businessMaterialsUrl, business.streetAddress,
      business.city, business.state, business.zipCode, business.phone, business.website, business.isArchived,
      business.locationId, business.demographicIds ? business.demographicIds.join(';') : '',
      business.material1Url, business.material1Title, business.material2Url, business.material2Title,
      business.material3Url, business.material3Title, business.material4Url, business.material4Title,
      business.material5Url, business.material5Title
    ].map(escapeCSV);
    return businessValues.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

export default function BusinessDownloadButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await downloadAllData();
      if (!data || !data.businesses) {
        throw new Error("No business data received");
      }
      const csvString = convertToBusinessCSV(data.businesses);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "businesses.csv";
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
        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300"
      >
        {isLoading ? "Downloading..." : "Download Business Data (CSV)"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

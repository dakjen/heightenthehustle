"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getAllBusinesses, toggleBusinessArchiveStatus } from "./actions"; // Assuming this action will be updated to take filters

// Define a type for a single business (matching your schema)
interface BusinessWithUserEmail {
  business: {
    id: number;
    userId: number;
    businessName: string;
    ownerName: string;
    percentOwnership: string;
    businessType: string;
    businessTaxStatus: string;
    businessDescription: string | null;
    businessIndustry: string;
    businessMaterialsUrl: string | null;
    streetAddress: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    phone: string | null;
    website: string | null;
    isArchived: boolean;
    logoUrl: string | null;
  };
  userEmail: string;
}

export default function BusinessSearchAndFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allBusinesses, setAllBusinesses] = useState<BusinessWithUserEmail[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  const searchQuery = searchParams.get("search") || "";
  const businessTypeFilter = searchParams.get("businessType") || "";
  const businessTaxStatusFilter = searchParams.get("businessTaxStatus") || "";
  const isArchivedFilter = searchParams.get("isArchived") === "true";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const deleteQueryString = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);
      return params.toString();
    },
    [searchParams]
  );

  const fetchBusinesses = useCallback(async () => {
    setLoadingBusinesses(true);
    const filters = {
      businessType: businessTypeFilter || undefined,
      businessTaxStatus: businessTaxStatusFilter || undefined,
      isArchived: isArchivedFilter || undefined,
    };
    const businessesData = await getAllBusinesses(searchQuery, filters);
    setAllBusinesses(businessesData);
    setLoadingBusinesses(false);
  }, [searchQuery, businessTypeFilter, businessTaxStatusFilter, isArchivedFilter]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleToggleArchive = async (businessId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const result = await toggleBusinessArchiveStatus(businessId, newStatus);
    if (result.error) {
      alert(result.error);
    } else {
      fetchBusinesses(); // Re-fetch businesses to update the list
    }
  };

  const handleBusinessClick = (businessId: number) => {
    router.push(`/dashboard/businesses/${businessId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      router.push(`/dashboard/admin/businesses?${createQueryString("search", value)}`);
    } else {
      router.push(`/dashboard/admin/businesses?${deleteQueryString("search")}`);
    }
  };

  const handleFilterChange = (name: string, value: string) => {
    if (value) {
      router.push(`/dashboard/admin/businesses?${createQueryString(name, value)}`);
    } else {
      router.push(`/dashboard/admin/businesses?${deleteQueryString(name)}`);
    }
  };

  const handleArchivedToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      router.push(`/dashboard/admin/businesses?${createQueryString("isArchived", "true")}`);
    } else {
      router.push(`/dashboard/admin/businesses?${deleteQueryString("isArchived")}`);
    }
  };

  return (
    <div className="mt-6 p-4 bg-white shadow-md rounded-lg">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search Bar */}
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Search Businesses</label>
          <input
            id="search"
            type="text"
            placeholder="Search by business name..."
            defaultValue={searchQuery}
            onChange={handleSearchChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          />
        </div>

        {/* Business Type Filter */}
        <div>
          <label htmlFor="businessTypeFilter" className="sr-only">Filter by Business Type</label>
          <select
            id="businessTypeFilter"
            defaultValue={businessTypeFilter}
            onChange={(e) => handleFilterChange("businessType", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          >
            <option value="">All Types</option>
            <option value="Sole Proprietorship">Sole Proprietorship</option>
            <option value="Partnership">Partnership</option>
            <option value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</option>
            <option value="Corporation">Corporation</option>
          </select>
        </div>

        {/* Business Tax Status Filter */}
        <div>
          <label htmlFor="businessTaxStatusFilter" className="sr-only">Filter by Tax Status</label>
          <select
            id="businessTaxStatusFilter"
            defaultValue={businessTaxStatusFilter}
            onChange={(e) => handleFilterChange("businessTaxStatus", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          >
            <option value="">All Tax Statuses</option>
            <option value="S-Corporation">S-Corporation</option>
            <option value="C-Corporation">C-Corporation</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>
      </div>

      {/* Archived Toggle */}
      <div className="flex items-center">
        <input
          id="isArchivedFilter"
          type="checkbox"
          checked={isArchivedFilter}
          onChange={handleArchivedToggle}
          className="h-4 w-4 text-[#910000] focus:ring-[#910000] border-gray-300 rounded"
        />
        <label htmlFor="isArchivedFilter" className="ml-2 block text-sm text-gray-900">
          Show Active Businesses
        </label>
      </div>

      {loadingBusinesses ? (
        <p className="mt-4 text-gray-700">Loading businesses...</p>
      ) : (
        <div className="mt-8 flex flex-col space-y-4">
          {allBusinesses.length === 0 ? (
            <p className="text-gray-700">No businesses found matching your criteria.</p>
          ) : (
            allBusinesses.map(({ business, userEmail }) => (
              <div key={business.id} className="flex items-center space-x-4">
                <button
                  onClick={() => handleBusinessClick(business.id)}
                  className={`flex-1 text-left py-4 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center space-x-4
                    ${business.isArchived ? 'bg-gray-200 text-gray-500 opacity-60' : 'bg-white hover:shadow-lg'}`}
                >
                  {business.logoUrl ? (
                    <Image src={business.logoUrl} alt={`${business.businessName} Logo`} width={40} height={40} className="rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold">
                      {business.businessName ? business.businessName[0].toUpperCase() : '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{business.businessName}</h3>
                    <p className="mt-2 text-sm text-gray-600">User: {userEmail}</p>
                    <p className="text-sm text-gray-600">Owner: {business.ownerName}</p>
                    <p className="text-sm text-gray-600">Type: {business.businessType}</p>
                    {business.isArchived && (
                      <p className="mt-2 text-sm font-semibold text-red-600">Archived</p>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleToggleArchive(business.id, business.isArchived)}
                  className={`py-2 px-4 rounded-md text-sm font-medium text-white
                    ${business.isArchived ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {business.isArchived ? 'Unarchive' : 'Archive'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

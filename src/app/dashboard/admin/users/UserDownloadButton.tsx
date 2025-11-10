'use client';

import { useState } from "react";
import { downloadAllData } from "./actions";

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
  isOptedOut: boolean;
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

const convertToUserCSV = (users: User[]): string => {
  const headers = [
    "User ID", "Name", "Email", "Phone", "Role", "Has Business Profile",
    "Personal Address", "Personal City", "Personal State", "Personal Zip Code",
    "Profile Photo URL", "Is Opted Out"
  ];

  const rows = users.map(user => {
    const userValues = [
      user.id, user.name, user.email, user.phone, user.role, user.hasBusinessProfile,
      user.personalAddress, user.personalCity, user.personalState, user.personalZipCode,
      user.profilePhotoUrl, user.isOptedOut
    ].map(escapeCSV);
    return userValues.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

export default function UserDownloadButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await downloadAllData();
      if (!data || !data.users) {
        throw new Error("No user data received");
      }
      const csvString = convertToUserCSV(data.users);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.csv";
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
        {isLoading ? "Downloading..." : "Download User Data (CSV)"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

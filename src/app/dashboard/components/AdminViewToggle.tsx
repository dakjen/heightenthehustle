"use client";

import { useState, useEffect } from "react";
import { setViewModeCookie } from "../actions";
import { useRouter } from "next/navigation";

interface AdminViewToggleProps {
  isAdmin: boolean;
}

export default function AdminViewToggle({ isAdmin }: AdminViewToggleProps) {
  const router = useRouter();
  const [isInternalUserView, setIsInternalUserView] = useState(false);

  useEffect(() => {
    // Read the cookie value on client-side to initialize state
    const viewMode = document.cookie.split('; ').find(row => row.startsWith('viewMode='))?.split('=')[1];
    setIsInternalUserView(viewMode === "internal");
  }, []);

  if (!isAdmin) {
    return null; // Only show toggle for admins
  }

  const handleToggle = async () => {
    const newInternalUserView = !isInternalUserView;
    setIsInternalUserView(newInternalUserView);

    await setViewModeCookie(newInternalUserView ? 'internal' : 'admin');
    router.refresh(); // Refresh the page to apply the new view mode
  };

  return (
    <div className="mt-6 p-2 bg-[#4a4a4a] rounded-md flex items-center justify-between">
      <span className="text-sm font-medium text-white">Internal User View</span>
      <label htmlFor="admin-toggle" className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id="admin-toggle"
          className="sr-only peer"
          checked={isInternalUserView}
          onChange={handleToggle}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
}

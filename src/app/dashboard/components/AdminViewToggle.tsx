"use client";

import { useState } from "react";

interface AdminViewToggleProps {
  isAdmin: boolean;
}

export default function AdminViewToggle({ isAdmin }: AdminViewToggleProps) {
  const [isInternalUserView, setIsInternalUserView] = useState(false);

  if (!isAdmin) {
    return null; // Only show toggle for admins
  }

  const handleToggle = () => {
    setIsInternalUserView(prev => !prev);
    // In a real application, this would involve:
    // 1. Setting a cookie or local storage item to persist the view mode.
    // 2. Potentially redirecting or triggering a global state update to change the view.
    console.log("Admin toggled internal user view to:", !isInternalUserView);
  };

  return (
    <div className="mt-6 p-2 bg-[#4a4a4a] rounded-md flex items-center justify-between">
      <span className="text-sm font-medium">Internal User View</span>
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

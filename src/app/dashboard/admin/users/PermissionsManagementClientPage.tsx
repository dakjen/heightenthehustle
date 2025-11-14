"use client";

import { useState } from "react";
import { updateUserPermissions } from "./actions"; // Will create this action
import { useFormState } from "react-dom";

import { FormState } from "@/types/form-state";

interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  password: string; // Note: In a real app, you\'t fetch password to client
  role: 'admin' | 'internal' | 'external';
  hasBusinessProfile: boolean;
  personalAddress: string | null;
  personalCity: string | null;
  personalState: string | null;
  personalZipCode: string | null;
  profilePhotoUrl: string | null;
  canApproveRequests: boolean; // New permission field
  canMessageAdmins: boolean; // New permission field
  canManageClasses: boolean; // New permission field
  canManageBusinesses: boolean; // New permission field
}

interface PermissionsManagementClientPageProps {
  initialUsers: User[];
}

export default function PermissionsManagementClientPage({ initialUsers }: PermissionsManagementClientPageProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissionsState, permissionsFormAction] = useFormState<FormState, FormData>(updateUserPermissions, { message: "" });

  const handleUserSelect = (userId: number) => {
    const user = initialUsers.find(u => u.id === userId);
    setSelectedUser(user || null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* User Selection */}
      <div className="md:w-1/3 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select User</h2>
        <select
          onChange={(e) => handleUserSelect(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
          defaultValue=""
        >
          <option value="" disabled>Select a user</option>
          {initialUsers.filter(user => user.role === 'internal').map(user => (
            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
          ))}
        </select>
      </div>

      {/* Permissions Form */}
      <div className="md:w-2/3 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Permissions</h2>
        {selectedUser ? (
          <form action={permissionsFormAction} className="space-y-4">
            <input type="hidden" name="userId" value={selectedUser.id} />
            <p className="text-lg font-medium">Permissions for {selectedUser.name}:</p>

            {/* Messaging Permissions */}
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="canMessageAdmins"
                  className="form-checkbox h-5 w-5 text-[#910000]"
                  defaultChecked={selectedUser.canMessageAdmins} // Pre-fill based on existing permissions
                />
                <span className="ml-2 text-gray-700">Can Message Admins</span>
              </label>
            </div>

            {/* Can Approve Requests Permission */}
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="canApproveRequests"
                  className="form-checkbox h-5 w-5 text-[#910000]"
                  defaultChecked={selectedUser.canApproveRequests}
                />
                <span className="ml-2 text-gray-700">Can Approve/Reject User Requests</span>
              </label>
            </div>

            {/* Can Manage Classes Permission */}
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="canManageClasses"
                  className="form-checkbox h-5 w-5 text-[#910000]"
                  defaultChecked={selectedUser.canManageClasses}
                />
                <span className="ml-2 text-gray-700">Can Manage HTH Classes</span>
              </label>
            </div>

            {/* Can Manage Businesses Permission */}
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="canManageBusinesses"
                  className="form-checkbox h-5 w-5 text-[#910000]"
                  defaultChecked={selectedUser.canManageBusinesses}
                />
                <span className="ml-2 text-gray-700">Can Manage Businesses</span>
              </label>
            </div>
            {/* Add more permission checkboxes here */}

            {permissionsState?.message && (
              <p className="text-sm text-green-600 mt-2">{permissionsState.message}</p>
            )}
            {permissionsState?.error && (
              <p className="text-sm text-red-600 mt-2">{permissionsState.error}</p>
            )}

            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Save Permissions
            </button>
          </form>
        ) : (
          <p className="text-gray-500">Select a user to manage their permissions.</p>
        )}
      </div>
    </div>
  );
}
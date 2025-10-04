"use client";

import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { createUser, getAllUsers } from "./actions"; // Import createUser and getAllUsers

type FormState = {
  message: string;
  error: string;
} | undefined;

// Define a type for a single user (matching your schema)
interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  password: string; // Note: In a real app, you wouldn't fetch password to client
  role: 'admin' | 'internal' | 'external';
  hasBusinessProfile: boolean;
  personalAddress: string | null;
  personalCity: string | null;
  personalState: string | null;
  personalZipCode: string | null;
  profilePhotoUrl: string | null;
}

interface UserManagementClientPageProps {
  initialUsers: User[];
  isInternalUserView: boolean; // New prop
}

export default function UserManagementClientPage({ initialUsers, isInternalUserView }: UserManagementClientPageProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createState, createFormAction] = useFormState<FormState, FormData>(createUser, undefined);
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers); // Initialize with server-fetched users

  // Re-fetch users after a new one is created or if initialUsers change (though initialUsers should be stable)
  useEffect(() => {
    async function fetchUsers() {
      const fetchedUsers = await getAllUsers(); // Use getAllUsers server action
      setAllUsers(fetchedUsers);
    }
    // Only re-fetch if createState indicates a change or if initialUsers are empty and we expect more
    if (createState?.message && !createState.error) {
      setShowCreateForm(false); // Hide form on success
      fetchUsers(); // Re-fetch to show the new user
    } else if (initialUsers.length === 0 && allUsers.length === 0) {
        // Initial fetch if no users were passed and none are set
        fetchUsers();
    }
  }, [createState, initialUsers, allUsers.length]);

  // Handle successful creation
  useEffect(() => {
    if (createState?.message && !createState.error) {
      setShowCreateForm(false); // Hide form on success
      // Optionally, show a success toast or message
    }
  }, [createState]);


  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      <p className="mt-4 text-gray-700">Manage all users in the system.</p>

      <div className="mt-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {showCreateForm ? "Cancel" : "Create New User"}
        </button>
      </div>

      {showCreateForm && (
        <div className="mt-8 max-w-2xl p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New User</h2>
          <form action={createFormAction} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="internal">Internal</option>
                <option value="external">External</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {createState?.message && (
              <p className="text-sm text-green-600">{createState.message}</p>
            )}
            {createState?.error && (
              <p className="text-sm text-red-600">{createState.error}</p>
            )}

            <div>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                  {!isInternalUserView && (
                    <a href="#" className="ml-4 text-red-600 hover:text-red-900">Delete</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { getAllPendingUserRequests, approveUser, rejectUser } from './actions';
import { InferSelectModel } from 'drizzle-orm';
import { users } from '@/db/schema';
import { FormState } from '@/types/form-state';

type User = InferSelectModel<typeof users> & { businessName?: string | null };

export default function UserRequestsClientPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await getAllPendingUserRequests();
      console.log("Fetched pending users:", users); // Add this line
      setPendingUsers(users);
    } catch (err) {
      console.error("Failed to fetch pending users:", err);
      setError("Failed to load pending user requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: number) => {
    try {
      const result: FormState = await approveUser(userId);
      if (result.error) {
        alert(`Failed to approve user: ${result.error}`);
      } else {
        alert(result.message);
        fetchPendingUsers(); // Refresh the list
      }
    } catch (err) {
      console.error("Error approving user:", err);
      alert("An unexpected error occurred while approving the user.");
    }
  };

  const handleReject = async (userId: number) => {
    try {
      const result: FormState = await rejectUser(userId);
      if (result.error) {
        alert(`Failed to reject user: ${result.error}`);
      } else {
        alert(result.message);
        fetchPendingUsers(); // Refresh the list
      }
    } catch (err) {
      console.error("Error rejecting user:", err);
      alert("An unexpected error occurred while rejecting the user.");
    }
  };

  if (loading) {
    return <p>Loading pending user requests...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Account Requests</h2>
      {pendingUsers.length === 0 ? (
        <p>No pending account requests.</p>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {pendingUsers.map((user) => (
              <li key={user.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name} ({user.email})</p>
                  <p className="text-sm text-gray-500">
                    Phone: {user.phone}
                    {user.businessName && <span className="ml-2"> | Business: {user.businessName}</span>}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

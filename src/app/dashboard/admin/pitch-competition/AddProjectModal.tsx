'use client';

import { useState } from "react";
import { users, businesses } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

type User = InferSelectModel<typeof users>;
type Business = InferSelectModel<typeof businesses>;

interface AddProjectModalProps {
  users: User[];
  businesses: Business[];
  onAdd: (project: { userId: string; businessId: string; pitchVideoUrl: string; pitchDeckUrl:string }) => void;
  isVisible: boolean;
  onClose: () => void;
}

export default function AddProjectModal({ users, businesses, onAdd, isVisible, onClose }: AddProjectModalProps) {
  const [userId, setUserId] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [pitchVideoUrl, setPitchVideoUrl] = useState("");
  const [pitchDeckUrl, setPitchDeckUrl] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAdd({ userId, businessId, pitchVideoUrl, pitchDeckUrl });
    onClose(); // Close modal after submission
  };

  if (!isVisible) return null;

  return (
    <>
      {isVisible && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Project</h3>
                  <div className="mt-2">
                    <div className="mb-4">
                      <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                        User
                      </label>
                      <select
                        id="user"
                        name="user"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="business" className="block text-sm font-medium text-gray-700">
                        Business
                      </label>
                      <select
                        id="business"
                        name="business"
                        value={businessId}
                        onChange={(e) => setBusinessId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a business</option>
                        {businesses.map((business) => (
                          <option key={business.id} value={business.id}>
                            {business.businessName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="pitchVideoUrl" className="block text-sm font-medium text-gray-700">
                        Pitch Video URL
                      </label>
                      <input
                        type="text"
                        name="pitchVideoUrl"
                        id="pitchVideoUrl"
                        value={pitchVideoUrl}
                        onChange={(e) => setPitchVideoUrl(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="pitchDeckUrl" className="block text-sm font-medium text-gray-700">
                        Pitch Deck URL
                      </label>
                      <input
                        type="text"
                        name="pitchDeckUrl"
                        id="pitchDeckUrl"
                        value={pitchDeckUrl}
                        onChange={(e) => setPitchDeckUrl(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={onClose} // Use onClose prop
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

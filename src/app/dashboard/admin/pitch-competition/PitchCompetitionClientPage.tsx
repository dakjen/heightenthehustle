'use client';

import { useState } from "react";
import { getPitchCompetitionEntries, getUsers, getBusinesses } from "./actions";
// import AddProjectModal from "./AddProjectModal";
// import { addProject } from "./server-actions";
import { InferSelectModel } from "drizzle-orm";
import { pitchCompetitions, users, businesses } from "@/db/schema";

type PitchCompetitionEntry = InferSelectModel<typeof pitchCompetitions> & {
  user: InferSelectModel<typeof users>;
  business: InferSelectModel<typeof businesses>;
};
type User = InferSelectModel<typeof users>;
type Business = InferSelectModel<typeof businesses>;

interface PitchCompetitionClientPageProps {
  initialEntries: PitchCompetitionEntry[];
  initialUsers: User[];
  initialBusinesses: Business[];
}

export default function PitchCompetitionClientPage({ initialEntries, initialUsers, initialBusinesses }: PitchCompetitionClientPageProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [users, setUsers] = useState(initialUsers);
  const [businesses, setBusinesses] = useState(initialBusinesses);

  const [activeTab, setActiveTab] = useState('all-entries');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Pitch Competition Management</h1>
        {/* <AddProjectModal users={users} businesses={businesses} onAdd={addProject} /> */}
      </div>

      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('all-entries')}
            className={`${activeTab === 'all-entries' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Entries
          </button>
          <button
            onClick={() => setActiveTab('pending-entries')}
            className={`${activeTab === 'pending-entries' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending Entries
          </button>
          <button
            onClick={() => setActiveTab('approved-entries')}
            className={`${activeTab === 'approved-entries' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Approved Entries
          </button>
        </nav>
      </div>

      {activeTab === 'all-entries' && (
        <div className="mt-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pitch Video
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pitch Deck
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.business.businessName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.pitchVideoUrl && (
                      <a href={entry.pitchVideoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                        View Video
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.pitchDeckUrl && (
                      <a href={entry.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                        View Deck
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'pending-entries' && (
        <div className="mt-8">
          <p>Content for Pending Entries tab.</p>
        </div>
      )}

      {activeTab === 'approved-entries' && (
        <div className="mt-8">
          <p>Content for Approved Entries tab.</p>
        </div>
      )}
    </div>
  );
}

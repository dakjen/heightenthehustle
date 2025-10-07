'use client';

import { useState } from "react";
import { InferSelectModel } from "drizzle-orm";
import { pitchCompetitions, users, businesses } from "@/db/schema";

type PitchCompetitionEntry = InferSelectModel<typeof pitchCompetitions> & {
  user: InferSelectModel<typeof users>;
  business: InferSelectModel<typeof businesses>;
};

interface ProjectDetailClientPageProps {
  project: PitchCompetitionEntry;
}

export default function ProjectDetailClientPage({ project }: ProjectDetailClientPageProps) {
  const [activeTab, setActiveTab] = useState('entries');

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Project: {project.business.businessName}</h1>

      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('entries')}
            className={`${activeTab === 'entries' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Entries
          </button>
          <button
            onClick={() => setActiveTab('finalists')}
            className={`${activeTab === 'finalists' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Finalists
          </button>
          <button
            onClick={() => setActiveTab('winners')}
            className={`${activeTab === 'winners' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Winners
          </button>
          <button
            onClick={() => setActiveTab('event-details')}
            className={`${activeTab === 'event-details' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Event Details
          </button>
        </nav>
      </div>

      {activeTab === 'entries' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Project Entries</h2>
          <p>Content for project entries.</p>
        </div>
      )}

      {activeTab === 'finalists' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Finalists</h2>
          <p>Content for finalists.</p>
        </div>
      )}

      {activeTab === 'winners' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Winners</h2>
          <p>Content for winners.</p>
        </div>
      )}

      {activeTab === 'event-details' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Event Details</h2>
          <p>Content for event details.</p>
        </div>
      )}
    </div>
  );
}

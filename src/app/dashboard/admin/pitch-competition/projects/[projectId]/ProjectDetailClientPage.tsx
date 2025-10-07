'use client';

import { useState } from "react";
import { InferSelectModel } from "drizzle-orm";
import { pitchCompetitions, users, businesses } from "@/db/schema";
import ProjectEntries from "./ProjectEntries";
import ProjectFinalists from "./ProjectFinalists";
import ProjectWinners from "./ProjectWinners";
import ProjectEventDetails from "./ProjectEventDetails";

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
        <ProjectEntries project={project} />
      )}

      {activeTab === 'finalists' && (
        <ProjectFinalists />
      )}

      {activeTab === 'winners' && (
        <ProjectWinners />
      )}

      {activeTab === 'event-details' && (
        <ProjectEventDetails />
      )}
    </div>
  );
}

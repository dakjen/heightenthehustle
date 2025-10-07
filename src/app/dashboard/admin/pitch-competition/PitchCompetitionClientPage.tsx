'use client';

import { useState } from "react";
import { getPitchCompetitionEntries, getUsers, getBusinesses } from "./actions";
import AddProjectModal from "./AddProjectModal";
import { addProject } from "./server-actions";
import { InferSelectModel } from "drizzle-orm";
import { pitchCompetitions, users, businesses, locations } from "@/db/schema";
import Link from "next/link";

type PitchCompetitionEntry = InferSelectModel<typeof pitchCompetitions> & {
  user: InferSelectModel<typeof users>;
  business: InferSelectModel<typeof businesses> & {
    location: InferSelectModel<typeof locations> | null;
  };
};
type User = InferSelectModel<typeof users>;
type Business = InferSelectModel<typeof businesses>;

interface PitchCompetitionClientPageProps {
  initialProjects: PitchCompetitionEntry[];
  initialUsers: User[];
  initialBusinesses: Business[];
}

export default function PitchCompetitionClientPage({ initialProjects, initialUsers, initialBusinesses }: PitchCompetitionClientPageProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [users, setUsers] = useState(initialUsers);
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [isModalOpen, setIsModalOpen] = useState(false); // New state for modal visibility

  const handleAddProject = async (project: { userId: string; businessId: string; pitchVideoUrl: string; pitchDeckUrl: string; }) => {
    await addProject(project);
    const updatedProjects = await getPitchCompetitionEntries();
    setProjects(updatedProjects);
    setIsModalOpen(false); // Close modal after adding project
  };

  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Pitch Competition Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Project
        </button>
        {isModalOpen && (
          <AddProjectModal users={users} businesses={businesses} onAdd={handleAddProject} isVisible={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}
      </div>

      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('projects')}
            className={`${activeTab === 'projects' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Projects
          </button>
        </nav>
      </div>

      {activeTab === 'projects' && (
        <div className="mt-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funding
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link href={`/dashboard/admin/pitch-competition/projects/${project.id}`} className="text-indigo-600 hover:underline">
                      {project.business.businessName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.business.location?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(project.submittedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$0</td> {/* Placeholder for funding */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

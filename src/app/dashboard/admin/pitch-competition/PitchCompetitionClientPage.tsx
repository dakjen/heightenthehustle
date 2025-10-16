'use client';

import { useState } from "react";
import { getPitchCompetitionEntries } from "./actions";
import AddProjectModal from "./AddProjectModal";
import { addProject } from "./server-actions";
import { InferSelectModel } from "drizzle-orm";
import { pitchCompetitions } from "@/db/schema";
import Link from "next/link";

type PitchCompetitionEntry = InferSelectModel<typeof pitchCompetitions>;

interface PitchCompetitionClientPageProps {
  initialProjects: string;
}

export default function PitchCompetitionClientPage({ initialProjects }: PitchCompetitionClientPageProps) {
  const [projects, setProjects] = useState<PitchCompetitionEntry[]>(JSON.parse(initialProjects));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddProject = async (project: { projectName: string; projectLocation: string; submissionDate: string; pitchVideoUrl: string; pitchDeckUrl: string; }) => {
    try {
      await addProject(project);
      const updatedEntries = await getPitchCompetitionEntries();
      setProjects(updatedEntries);
      setIsModalOpen(false);
    } catch (error) { 
      console.error("Failed to add project:", error);
      alert(`Failed to add project: ${error instanceof Error ? error.message : String(error)}`);
    }
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
          <AddProjectModal
            onAdd={handleAddProject}
            onClose={() => setIsModalOpen(false)}
          />
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
                      {project.projectName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.projectLocation || 'N/A'}</td>
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

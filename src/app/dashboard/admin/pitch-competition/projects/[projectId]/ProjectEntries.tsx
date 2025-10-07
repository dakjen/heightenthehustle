'use client';

import { InferSelectModel } from "drizzle-orm";
import { pitchCompetitions, users, businesses } from "@/db/schema";

type PitchCompetitionEntry = InferSelectModel<typeof pitchCompetitions> & {
  user: InferSelectModel<typeof users>;
  business: InferSelectModel<typeof businesses>;
};

interface ProjectEntriesProps {
  project: PitchCompetitionEntry;
}

export default function ProjectEntries({ project }: ProjectEntriesProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">Project Entries</h2>
      <div className="mt-4">
        <p><strong>Business Name:</strong> {project.business.businessName}</p>
        <p><strong>Owner Name:</strong> {project.user.name}</p>
        {project.pitchVideoUrl && (
          <p><strong>Pitch Video:</strong> <a href={project.pitchVideoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Video</a></p>
        )}
        {project.pitchDeckUrl && (
          <p><strong>Pitch Deck:</strong> <a href={project.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Deck</a></p>
        )}
        <p><strong>Submitted At:</strong> {new Date(project.submittedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}

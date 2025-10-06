'use client';

import { PitchCompetition } from "@/db/schema";

interface PitchCompetitionProps {
  pitchCompetition: PitchCompetition | null;
}

export default function PitchCompetitionDetails({ pitchCompetition }: PitchCompetitionProps) {
  if (!pitchCompetition) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Pitch Competition</h2>
        <p>This business has not submitted a pitch competition entry.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">Pitch Competition</h2>
      {pitchCompetition.pitchVideoUrl && (
        <div className="mt-4">
          <h3 className="text-xl font-bold">Pitch Video</h3>
          <a href={pitchCompetition.pitchVideoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
            Watch Video
          </a>
        </div>
      )}
      {pitchCompetition.pitchDeckUrl && (
        <div className="mt-4">
          <h3 className="text-xl font-bold">Pitch Deck</h3>
          <a href={pitchCompetition.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
            View Deck
          </a>
        </div>
      )}
    </div>
  );
}

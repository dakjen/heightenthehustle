'use server';

import { db } from "@/db";
import { pitchCompetitions } from "@/db/schema";

export async function getPitchCompetitionEntries() {
  try {
    const entries = await db.query.pitchCompetitions.findMany({
      with: {
        user: true,
        business: true,
      },
    });
    return entries;
  } catch (error) {
    console.error("Error fetching pitch competition entries:", error);
    return [];
  }
}

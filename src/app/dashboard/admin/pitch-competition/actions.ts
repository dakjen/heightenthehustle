'use server';

import { db } from "@/db";
import { pitchCompetitions, users, businesses, locations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getPitchCompetitionEntries() {
  try {
    const entries = await db.query.pitchCompetitions.findMany({
      with: {
        user: true,
        business: {
          with: {
            location: true,
          },
        },
      },
    });
    return entries;
  } catch (error) {
    console.error("Error fetching pitch competition entries:", error);
    return [];
  }
}

export async function getUsers() {
  try {
    const allUsers = await db.query.users.findMany();
    return allUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getBusinesses() {
  try {
    const allBusinesses = await db.query.businesses.findMany();
    return allBusinesses;
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return [];
  }
}

export async function getPitchCompetitionEntryById(id: number) {
  try {
    const entry = await db.query.pitchCompetitions.findFirst({
      where: eq(pitchCompetitions.id, id),
      with: {
        user: true,
        business: true,
      },
    });
    return entry;
  } catch (error) {
    console.error("Error fetching pitch competition entry by ID:", error);
    return null;
  }
}

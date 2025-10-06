'use server';

import { db } from "@/db";
import { pitchCompetitions, users, businesses } from "@/db/schema";

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

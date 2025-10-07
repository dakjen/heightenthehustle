'use server';

import { db } from "@/db";
import { pitchCompetitions } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function addProject(project: { userId: string; businessId: string; pitchVideoUrl: string; pitchDeckUrl: string; }) {
  await db.insert(pitchCompetitions).values({
    userId: parseInt(project.userId),
    businessId: parseInt(project.businessId),
    pitchVideoUrl: project.pitchVideoUrl,
    pitchDeckUrl: project.pitchDeckUrl,
  });
  revalidatePath("/dashboard/admin/pitch-competition");
}

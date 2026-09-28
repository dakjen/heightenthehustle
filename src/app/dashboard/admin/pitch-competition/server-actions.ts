'use server';

import { db } from "@/db";
import { pitchCompetitionEvents, pitchSubmissions } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/login/actions";
import { isStaff } from "@/lib/auth";

export async function createPitchCompetitionEvent(event: {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can create competition events.");
  }

  await db.insert(pitchCompetitionEvents).values({
    ...event,
    createdById: session.user.id,
  });

  revalidatePath("/dashboard/admin/pitch-competition");
}

export async function getPitchCompetitionEvents() {
  return await db.query.pitchCompetitionEvents.findMany({
    // Newest event first by event date; undated ones last.
    orderBy: (events, { desc, sql }) => [sql`${events.startDate} DESC NULLS LAST`, desc(events.createdAt)],
  });
}

export async function getPitchSubmissionsForEvent(eventId: number) {
  const session = await getSession();
  if (!session?.user || !isStaff(session.user)) return []; // staff only
  return await db.query.pitchSubmissions.findMany({
    where: eq(pitchSubmissions.competitionEventId, eventId),
    with: {
      user: true, // Include user details with each submission
    },
    orderBy: (submissions, { desc }) => [desc(submissions.submittedAt)],
  });
}

export async function getSubmissionById(submissionId: number) {
  const session = await getSession();
  if (!session?.user || !isStaff(session.user)) return null; // staff only
  return await db.query.pitchSubmissions.findFirst({
    where: eq(pitchSubmissions.id, submissionId),
    with: {
      user: true, // Include user details
    },
  });
}
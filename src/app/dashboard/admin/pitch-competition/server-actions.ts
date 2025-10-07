'use server';

import { db } from "@/db";
import { pitchCompetitions, businesses, locations, users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/app/login/actions";

export async function addProject(project: { projectName: string; projectLocation: string; submissionDate: string; pitchVideoUrl: string; pitchDeckUrl: string; }) {
  const session = await getSession();
  if (!session || !session.user) {
    throw new Error("User not authenticated.");
  }

  // For now, we'll use the current user's ID as the userId for the pitch competition
  // and create a dummy business if needed, or link to an existing one.
  // This part needs refinement based on actual business creation/selection flow.
  let businessId: number;
  let locationId: number;

  // Find or create location
  const existingLocation = await db.query.locations.findFirst({
    where: eq(locations.name, project.projectLocation),
  });

  if (existingLocation) {
    locationId = existingLocation.id;
  } else {
    const newLocation = await db.insert(locations).values({ name: project.projectLocation }).returning({ id: locations.id });
    locationId = newLocation[0].id;
  }

  // Find or create business
  const existingBusiness = await db.query.businesses.findFirst({
    where: and(eq(businesses.businessName, project.projectName), eq(businesses.locationId, locationId)),
  });

  if (existingBusiness) {
    businessId = existingBusiness.id;
  } else {
    // Create a dummy business for the project if it doesn't exist
    const newBusiness = await db.insert(businesses).values({
      userId: session.user.id,
      businessName: project.projectName,
      ownerName: session.user.name, // Assuming current user is owner
      percentOwnership: "100",
      businessType: "Sole Proprietorship", // Default type
      businessTaxStatus: "Not Applicable", // Default status
      businessIndustry: "General", // Default industry
      locationId: locationId,
    }).returning({ id: businesses.id });
    businessId = newBusiness[0].id;
  }

  await db.insert(pitchCompetitions).values({
    userId: session.user.id,
    businessId: businessId,
    projectName: project.projectName,
    projectLocation: project.projectLocation,
    pitchVideoUrl: project.pitchVideoUrl,
    pitchDeckUrl: project.pitchDeckUrl,
    submittedAt: new Date(project.submissionDate),
  });
  revalidatePath("/dashboard/admin/pitch-competition");
}

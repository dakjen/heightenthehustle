"use server";

import { db } from "@/db";
import { businesses, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, SessionPayload } from "@/app/login/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type FormState = {
  message: string;
  error: string;
} | undefined;

// Helper function to get user ID from session
async function getUserIdFromSession(): Promise<number | undefined> {
  const session: SessionPayload | null = await getSession();
  return session?.user?.id;
}

export async function getBusinessProfile(userId: number) {
  try {
    const profile = await db.query.businesses.findFirst({
      where: eq(businesses.userId, userId),
    });
    return profile;
  } catch (error) {
    console.error("Error fetching business profile:", error);
    return null;
  }
}

export async function createBusinessProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return { message: "", error: "User not authenticated." };
  }

  const ownerName = formData.get("ownerName") as string;
  const percentOwnership = parseFloat(formData.get("percentOwnership") as string);
  const businessName = formData.get("businessName") as string;
  const businessType = formData.get("businessType") as string;
  const businessTaxStatus = formData.get("businessTaxStatus") as string;
  const businessDescription = formData.get("businessDescription") as string;
  const businessIndustry = formData.get("businessIndustry") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const website = formData.get("website") as string;
  const businessMaterials = formData.get("businessMaterials") as File; // Placeholder for file

  if (!ownerName || isNaN(percentOwnership) || !businessName || !businessType || !businessTaxStatus || !businessIndustry) {
    return { message: "", error: "Required fields are missing." };
  }

  try {
    // Check if a profile already exists for this user
    const existingProfile = await getBusinessProfile(userId);

    if (existingProfile) {
      return { message: "", error: "Business profile already exists. Please update instead." };
    }

    // Placeholder for file upload logic
    let businessMaterialsUrl: string | undefined;
    if (businessMaterials && businessMaterials.size > 0) {
      // In a real application, you would upload this file to a storage service (e.g., S3, Vercel Blob)
      // and get a URL. For now, we'll just log it.
      console.log("Attempting to upload file:", businessMaterials.name);
      businessMaterialsUrl = "https://example.com/placeholder-material.pdf"; // Placeholder URL
    }

    await db.insert(businesses).values({
      userId,
      ownerName,
      percentOwnership,
      businessName,
      businessType: businessType as any, // Cast to any for enum type
      businessTaxStatus: businessTaxStatus as any, // Cast to any for enum type
      businessDescription,
      businessIndustry,
      address,
      phone,
      website,
      businessMaterialsUrl,
    });

    // Update user's hasBusinessProfile status
    await db.update(users)
      .set({ hasBusinessProfile: true })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard/businesses");
    redirect("/dashboard"); // Redirect to dashboard after creation
    return { message: "Business profile created successfully!", error: "" };
  } catch (error) {
    console.error("Error creating business profile:", error);
    return { message: "", error: "Failed to create business profile." };
  }
}

export async function updateBusinessProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return { message: "", error: "User not authenticated." };
  }

  const ownerName = formData.get("ownerName") as string;
  const percentOwnership = parseFloat(formData.get("percentOwnership") as string);
  const businessName = formData.get("businessName") as string;
  const businessType = formData.get("businessType") as string;
  const businessTaxStatus = formData.get("businessTaxStatus") as string;
  const businessDescription = formData.get("businessDescription") as string;
  const businessIndustry = formData.get("businessIndustry") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const website = formData.get("website") as string;
  const businessMaterials = formData.get("businessMaterials") as File; // Placeholder for file

  if (!ownerName || isNaN(percentOwnership) || !businessName || !businessType || !businessTaxStatus || !businessIndustry) {
    return { message: "", error: "Required fields are missing." };
  }

  try {
    // Placeholder for file upload logic
    let businessMaterialsUrl: string | undefined;
    if (businessMaterials && businessMaterials.size > 0) {
      console.log("Attempting to upload file:", businessMaterials.name);
      businessMaterialsUrl = "https://example.com/placeholder-material.pdf"; // Placeholder URL
    }

    await db.update(businesses)
      .set({
        ownerName,
        percentOwnership,
        businessName,
        businessType: businessType as any,
        businessTaxStatus: businessTaxStatus as any,
        businessDescription,
        businessIndustry,
        address,
        phone,
        website,
        businessMaterialsUrl: businessMaterialsUrl || undefined, // Only update if new file uploaded
      })
      .where(eq(businesses.userId, userId));

    revalidatePath("/dashboard/businesses");
    return { message: "Business profile updated successfully!", error: "" };
  } catch (error) {
    console.error("Error updating business profile:", error);
    return { message: "", error: "Failed to update business profile." };
  }
}

"use server";

import { db } from "@/db";
import { businesses, users, businessTypeEnum, businessTaxStatusEnum } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, SessionPayload } from "@/app/login/actions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { InferInsertModel } from "drizzle-orm"; // Import InferInsertModel

type FormState = {
  message: string;
  error: string;
} | undefined;

type NewBusiness = InferInsertModel<typeof businesses>; // Define type for new business

// Helper function to get user ID from session
async function getUserIdFromSession(): Promise<number | undefined> {
  const session: SessionPayload | null = await getSession();
  return session?.user?.id;
}

export async function getBusinessProfile(businessId: number) {
  try {
    const profile = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
    });
    return profile;
  } catch (error) {
    console.error("Error fetching business profile:", error);
    return null;
  }
}

export async function getAllUserBusinesses(userId: number) {
  try {
    const allBusinesses = await db.query.businesses.findMany({
      where: eq(businesses.userId, userId),
      orderBy: (businesses, { asc, desc }) => [asc(businesses.isArchived), asc(businesses.businessName)], // Order by archived status then name
    });
    return allBusinesses;
  } catch (error) {
    console.error("Error fetching all user businesses:", error);
    return [];
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
    // Placeholder for file upload logic
    let businessMaterialsUrl: string | undefined;
    if (businessMaterials && businessMaterials.size > 0) {
      // In a real application, you would upload this file to a storage service (e.g., S3, Vercel Blob)
      // and get a URL. For now, we'll just log it.
      console.log("Attempting to upload file:", businessMaterials.name);
      businessMaterialsUrl = "https://example.com/placeholder-material.pdf"; // Placeholder URL
    }

    const newBusinessData: NewBusiness = {
      userId,
      ownerName,
      percentOwnership: percentOwnership.toString(),
      businessName,
      businessType: businessType as typeof businessTypeEnum.enumValues[number],
      businessTaxStatus: businessTaxStatus as typeof businessTaxStatusEnum.enumValues[number],
      businessDescription,
      businessIndustry,
      address,
      phone,
      website,
      businessMaterialsUrl,
    };

    await db.insert(businesses).values(newBusinessData);

    revalidatePath("/dashboard/businesses");
    redirect("/dashboard/businesses"); // Redirect to dashboard after creation
    return { message: "Business profile created successfully!", error: "" };
  } catch (error) {
    console.error("Error creating business profile:", error);
    return { message: "", error: "Failed to create business profile." };
  }
}

export async function updateBusinessProfile(businessId: number, prevState: FormState, formData: FormData): Promise<FormState> {
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
        percentOwnership: percentOwnership.toString(),
        businessName,
        businessType: businessType as typeof businessTypeEnum.enumValues[number],
        businessTaxStatus: businessTaxStatus as typeof businessTaxStatusEnum.enumValues[number],
        businessDescription,
        businessIndustry,
        address,
        phone,
        website,
        businessMaterialsUrl: businessMaterialsUrl || undefined, // Only update if new file uploaded
      })
      .where(eq(businesses.id, businessId));

    revalidatePath("/dashboard/businesses");
    revalidatePath(`/dashboard/businesses/${businessId}`); // Revalidate specific business page
    return { message: "Business profile updated successfully!", error: "" };
  } catch (error) {
    console.error("Error updating business profile:", error);
    return { message: "", error: "Failed to update business profile." };
  }
}

export async function archiveBusiness(businessId: number): Promise<FormState> {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return { message: "", error: "User not authenticated." };
  }

  try {
    await db.update(businesses)
      .set({ isArchived: true })
      .where(eq(businesses.id, businessId));

    revalidatePath("/dashboard/businesses");
    revalidatePath(`/dashboard/businesses/${businessId}`);
    return { message: "Business archived successfully!", error: "" };
  } catch (error) {
    console.error("Error archiving business:", error);
    return { message: "", error: "Failed to archive business." };
  }
}

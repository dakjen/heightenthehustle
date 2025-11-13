'use server';

import { db } from "@/db";
import { businesses, businessTypeEnum, businessTaxStatusEnum, demographics, Business, Demographic, businessesRelations, BusinessWithDemographic, BusinessWithLocation } from "@/db/schema";
import { eq, like, and, InferSelectModel } from "drizzle-orm";
import { getSession, SessionPayload } from "@/app/login/actions";
import { revalidatePath, unstable_noStore } from "next/cache";
import { put } from "@vercel/blob";
import { InferInsertModel } from "drizzle-orm"; // Import InferInsertModel

import { FormState } from "@/types/form-state";

type NewBusiness = InferInsertModel<typeof businesses>; // Define type for new business

// Define a type for Business with its demographic relation using InferResult


// Helper function to get user ID from session
async function getUserIdFromSession(): Promise<number | undefined> {
  const session: SessionPayload | null = await getSession();
  return session?.user?.id;
}

export async function fetchSession(): Promise<SessionPayload | null> {
  return await getSession();
}

export async function getBusinessProfile(businessId: number): Promise<BusinessWithLocation | null> {
  unstable_noStore();
  try {
    const profile = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
      with: {
        location: true,
        stateLocation: true,
        regionLocation: true,
      },
      // Explicitly select demographicIds to ensure it's always included
      columns: {
        demographicIds: true,
        id: true,
        userId: true,
        businessName: true,
        ownerName: true,
        percentOwnership: true,
        businessType: true,
        businessTaxStatus: true,
        businessDescription: true,
        businessIndustry: true,
        naicsCode: true,
        logoUrl: true,
        businessProfilePhotoUrl: true,
        businessMaterialsUrl: true,
        streetAddress: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        website: true,
        isArchived: true,
        locationId: true,
        stateLocationId: true,
        regionLocationId: true,
        material1Url: true,
        material1Title: true,
        material2Url: true,
        material2Title: true,
        material3Url: true,
        material3Title: true,
        material4Url: true,
        material4Title: true,
        material5Url: true,
        material5Title: true,
      }
    });
    if (!profile) { return null; }
    return profile;
  } catch (error) {
    console.error("Error fetching business profile:", error);
    return null;
  }
}

export async function getAllUserBusinesses(userId: number, searchQuery?: string, filters?: { businessType?: string; businessTaxStatus?: string; isArchived?: boolean; }) {
  try {
    const conditions = [eq(businesses.userId, userId)];

    if (searchQuery) {
      conditions.push(like(businesses.businessName, `%${searchQuery}%`));
    }

    if (filters?.businessType) {
      conditions.push(eq(businesses.businessType, filters.businessType as typeof businessTypeEnum.enumValues[number]));
    }

    if (filters?.businessTaxStatus) {
      conditions.push(eq(businesses.businessTaxStatus, filters.businessTaxStatus as typeof businessTaxStatusEnum.enumValues[number]));
    }

    if (filters?.isArchived !== undefined) {
      conditions.push(eq(businesses.isArchived, filters.isArchived));
    }

    const allBusinesses = await db.query.businesses.findMany({
      where: and(...conditions),
      orderBy: (businesses, { asc, desc }) => [asc(businesses.isArchived), asc(businesses.businessName)],
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
  const naicsCode = formData.get("naicsCode") as string;
  const streetAddress = formData.get("streetAddress") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zipCode = formData.get("zipCode") as string;
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
      naicsCode,
      streetAddress,
      city,
      state,
      zipCode,
      phone,
      website,
      businessMaterialsUrl,
    };

    await db.insert(businesses).values(newBusinessData);

    revalidatePath("/dashboard/businesses");
    return { message: "Business profile created successfully!", error: "" };
  } catch (error) {
    console.error("Error creating business profile:", error);
    return { message: "", error: "Failed to create business profile." };
  }
}

export async function updateBusinessProfileWithMaterials(prevState: FormState, formData: FormData): Promise<FormState> {
    const userId = await getUserIdFromSession();

    if (!userId) {
      return { message: "", error: "User not authenticated." };
    }

    const businessId = parseInt(formData.get("businessId") as string);

    if (isNaN(businessId)) {
      return { message: "", error: "Business ID is invalid." };
    }

    const ownerName = formData.get("ownerName") as string;
    const percentOwnership = parseFloat(formData.get("percentOwnership") as string);
    const businessName = formData.get("businessName") as string;
    const businessType = formData.get("businessType") as string;
    const businessTaxStatus = formData.get("businessTaxStatus") as string;
    const businessDescription = formData.get("businessDescription") as string;
    const businessIndustry = formData.get("businessIndustry") as string;
    const naicsCode = formData.get("naicsCode") as string;
    const streetAddress = formData.get("streetAddress") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const phone = formData.get("phone") as string;
    const website = formData.get("website") as string;
    const businessMaterials = formData.get("businessMaterials") as File; // Placeholder for file
    const logo = formData.get("logo") as File; // New: Get logo file
    const businessProfilePhoto = formData.get("businessProfilePhoto") as File; // New: Get business profile photo file

    // New: Handle 5 material uploads and titles
    const materialUpdates: { urlField: string; titleField: string; url?: string; title?: string; }[] = [];
    for (let i = 1; i <= 5; i++) {
      const materialFile = formData.get(`material${i}`) as File;
      const materialTitle = formData.get(`material${i}Title`) as string;
      const update: { urlField: string; titleField: string; url?: string; title?: string; } = {
        urlField: `material${i}Url`,
        titleField: `material${i}Title`,
      };

      if (materialFile && materialFile.size > 0) {
        const blob = await put(materialFile.name, materialFile, { access: 'public', allowOverwrite: true });
        update.url = blob.url;
      }
      if (materialTitle) {
        update.title = materialTitle;
      }
      materialUpdates.push(update);
    }

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

      // New: Handle logo upload
      let logoUrl: string | undefined;
      if (logo && logo.size > 0) {
        const blob = await put(logo.name, logo, { access: 'public', allowOverwrite: true });
        logoUrl = blob.url;
      }

      // New: Handle business profile photo upload
      let businessProfilePhotoUrl: string | undefined;
      if (businessProfilePhoto && businessProfilePhoto.size > 0) {
        const blob = await put(businessProfilePhoto.name, businessProfilePhoto, { access: 'public', allowOverwrite: true });
        businessProfilePhotoUrl = blob.url;
      }

      const updateData: Partial<InferInsertModel<typeof businesses>> & { [key: string]: string | number | boolean | undefined | null } = {
        ownerName,
        percentOwnership: percentOwnership.toString(),
        businessName,
        businessType: businessType as typeof businessTypeEnum.enumValues[number],
        businessTaxStatus: businessTaxStatus as typeof businessTaxStatusEnum.enumValues[number],
        businessDescription,
        businessIndustry,
        naicsCode,
        streetAddress,
        city,
        state,
        zipCode,
        phone,
        website,
        businessMaterialsUrl: businessMaterialsUrl || undefined, // Only update if new file uploaded
        logoUrl: logoUrl || undefined, // New: Update logoUrl
        businessProfilePhotoUrl: businessProfilePhotoUrl || undefined, // New: Update business profile photo url
      };

      // Apply material updates
      materialUpdates.forEach(update => {
        if (update.url !== undefined) {
          updateData[update.urlField] = update.url;
        }
        if (update.title !== undefined) {
          updateData[update.titleField] = update.title;
        }
      });

      await db.update(businesses)
        .set(updateData)
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

export async function updateBusinessDemographics(prevState: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return { message: "", error: "User not authenticated." };
  }

  const businessId = parseInt(formData.get("businessId") as string);
  const selectedGenderId = parseInt(formData.get("gender") as string);
  const selectedRaceId = parseInt(formData.get("race") as string);
  const selectedReligionId = parseInt(formData.get("religion") as string);
  const isTransgender = formData.get("isTransgender") === "true";
  const isCisgender = formData.get("isCisgender") === "true";
  const stateLocationId = parseInt(formData.get("stateLocationId") as string);
  const regionLocationId = parseInt(formData.get("regionLocationId") as string);
  const city = formData.get("city") as string;

  // Fetch current business profile to get existing demographic IDs
  const currentBusiness = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
    columns: { demographicIds: true }
  });

  const existingDemographicIds = currentBusiness?.demographicIds || [];

  // Fetch Transgender and Cisgender demographic IDs from the database
  const transgenderDemographic = await db.query.demographics.findFirst({ where: eq(demographics.name, 'Transgender') });
  const cisgenderDemographic = await db.query.demographics.findFirst({ where: eq(demographics.name, 'Cisgender') });

  const transgenderId = transgenderDemographic?.id;
  const cisgenderId = cisgenderDemographic?.id;

  // Get all demographic IDs related to Gender, Race, Religion, Transgender, Cisgender
  // to filter them out from existingDemographicIds
  const demographicCategoriesToUpdate = ['Gender', 'Race', 'Religion'] as const;
  const demographicNamesToUpdate = ['Transgender', 'Cisgender'];

  const allDemographicsToUpdate = await db.query.demographics.findMany({
    where: (demographics, { inArray }) => inArray(demographics.category, demographicCategoriesToUpdate)
  });

  const idsToFilterOut = new Set(allDemographicsToUpdate.map(d => d.id));
  if (transgenderId) idsToFilterOut.add(transgenderId);
  if (cisgenderId) idsToFilterOut.add(cisgenderId);

  // Filter out existing IDs that are managed by this form
  const preservedDemographicIds = existingDemographicIds.filter(id => !idsToFilterOut.has(id));

  const newDemographicIds: number[] = [...preservedDemographicIds];

  // Add newly selected Gender, Race, Religion if selected
  if (!isNaN(selectedGenderId)) newDemographicIds.push(selectedGenderId);
  if (!isNaN(selectedRaceId)) newDemographicIds.push(selectedRaceId);
  if (!isNaN(selectedReligionId)) newDemographicIds.push(selectedReligionId);

  // Add Transgender/Cisgender IDs if checked
  if (isTransgender && transgenderId) {
    newDemographicIds.push(transgenderId);
  }
  if (isCisgender && cisgenderId) {
    newDemographicIds.push(cisgenderId);
  }

  const dataToUpdate: { demographicIds?: number[] | null; stateLocationId?: number | null; regionLocationId?: number | null; city?: string | null } = {};

  if (newDemographicIds.length > 0) {
    dataToUpdate.demographicIds = newDemographicIds;
  } else {
    dataToUpdate.demographicIds = null; // Explicitly set to null if empty
  }

  if (!isNaN(stateLocationId)) {
    dataToUpdate.stateLocationId = stateLocationId;
  } else {
    dataToUpdate.stateLocationId = null;
  }

  if (!isNaN(regionLocationId)) {
    dataToUpdate.regionLocationId = regionLocationId;
  }
  else {
    dataToUpdate.regionLocationId = null;
  }

  if (city !== null && city !== undefined) { // Check for null and undefined to allow empty string
    dataToUpdate.city = city;
  } else {
    dataToUpdate.city = null;
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return { message: "", error: `No demographic or location data to update. Received: stateLocationId=${stateLocationId}, regionLocationId=${regionLocationId}, demographicIds=${JSON.stringify(newDemographicIds)}` };
  }

  try {
    await db.update(businesses)
      .set(dataToUpdate)
      .where(eq(businesses.id, businessId));

    revalidatePath(`/dashboard/businesses/${businessId}`);
    return { message: `Business details updated successfully! Please refresh to see changes.`, error: "" };
  } catch (error) {
    console.error("Error updating business details:", error);
    return { message: "", error: "Failed to update business details." };
  }
}

export async function updateBusinessMaterials(prevState: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return { message: "", error: "User not authenticated." };
  }

  const businessId = parseInt(formData.get("businessId") as string);

  if (isNaN(businessId)) {
    return { message: "", error: "Business ID is invalid." };
  }

  try {
    const materialUpdates: { urlField: string; titleField: string; url?: string; title?: string; }[] = [];
    for (let i = 1; i <= 5; i++) {
      const materialFile = formData.get(`material${i}`) as File;
      const materialTitle = formData.get(`material${i}Title`) as string;
      const update: { urlField: string; titleField: string; url?: string; title?: string; } = {
        urlField: `material${i}Url`,
        titleField: `material${i}Title`,
      };

      if (materialFile && materialFile.size > 0) {
        const blob = await put(materialFile.name, materialFile, { access: 'public', allowOverwrite: true });
        update.url = blob.url;
      }
      if (materialTitle) {
        update.title = materialTitle;
      }
      materialUpdates.push(update);
    }

    const updateData: Partial<InferInsertModel<typeof businesses>> & { [key: string]: string | number | boolean | undefined | null } = {};

    // Apply material updates
    materialUpdates.forEach(update => {
      if (update.url !== undefined) {
        updateData[update.urlField] = update.url;
      }
      if (update.title !== undefined) {
        updateData[update.titleField] = update.title;
      }
    });

    if (Object.keys(updateData).length > 0) {
      await db.update(businesses)
        .set(updateData)
        .where(eq(businesses.id, businessId));
    }

    revalidatePath(`/dashboard/businesses/${businessId}`);
    return { message: "Business materials updated successfully!", error: "" };
  } catch (error) {
    console.error("Error updating business materials:", error);
    return { message: "", error: "Failed to update business materials." };
  }
}


export async function searchBusinesses(query: string): Promise<Business[]> {
  try {
    const allBusinesses = await db.query.businesses.findMany({
      where: like(businesses.businessName, `%${query}%`),
    });
    return allBusinesses;
  } catch (error) {
    console.error("Error searching businesses:", error);
    return [];
  }
}

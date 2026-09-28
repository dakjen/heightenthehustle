'use server';

import { db } from "@/db";
import { businesses, businessTypeEnum, businessTaxStatusEnum, demographics, users, Business, BusinessWithLocation } from "@/db/schema";
import { eq, like, and } from "drizzle-orm";
import { getSession, SessionPayload } from "@/app/login/actions";
import { businessAccess, isStaff } from "@/lib/auth";
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
  if (!(await businessAccess(businessId))) return null; // owner or staff only
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
  // Members can only list their own businesses; staff may pass any userId.
  const session = await getSession();
  if (!session?.user) return [];
  if (!isStaff(session.user)) userId = session.user.id;
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
      orderBy: (businesses, { asc }) => [asc(businesses.isArchived), asc(businesses.businessName)],
    });
    return allBusinesses;
  } catch (error) {
    console.error("Error fetching all user businesses:", error);
    return [];
  }
}

const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','PR',
]);

const MATERIAL_MAX_BYTES = 10 * 1024 * 1024; // matches next.config serverActions bodySizeLimit
const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const MATERIAL_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
]);

function text(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === 'string' ? v.trim() : '';
}

/** Adds https:// when the user typed a bare domain like "mybusiness.com". */
function normalizeWebsite(raw: string): string | null {
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return raw;
  }
}

export async function createBusinessProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { message: "", error: "Your session has expired. Please log in again." };
  }

  const ownerName = text(formData, "ownerName");
  const percentRaw = text(formData, "percentOwnership");
  const percentOwnership = percentRaw === '' ? NaN : Number(percentRaw);
  const businessName = text(formData, "businessName");
  const businessType = text(formData, "businessType");
  const businessTaxStatus = text(formData, "businessTaxStatus");
  const businessDescription = text(formData, "businessDescription");
  const businessIndustry = text(formData, "businessIndustry");
  const naicsCode = text(formData, "naicsCode");
  const streetAddress = text(formData, "streetAddress");
  const city = text(formData, "city");
  const state = text(formData, "state").toUpperCase();
  const zipCode = text(formData, "zipCode");
  const phone = text(formData, "phone");
  const website = text(formData, "website");
  const businessMaterials = formData.get("businessMaterials");
  const materialsFile = businessMaterials instanceof File && businessMaterials.size > 0 ? businessMaterials : null;
  const logo = formData.get("logo");
  const logoFile = logo instanceof File && logo.size > 0 ? logo : null;

  // Validate every field up front so the user sees all problems at once.
  const fieldErrors: Record<string, string> = {};
  if (!businessName) fieldErrors.businessName = "Enter your business name.";
  if (!ownerName) fieldErrors.ownerName = "Enter the owner's full name.";
  if (Number.isNaN(percentOwnership) || percentOwnership <= 0 || percentOwnership > 100) {
    fieldErrors.percentOwnership = "Enter a percentage between 1 and 100.";
  }
  if (!businessTypeEnum.enumValues.includes(businessType as typeof businessTypeEnum.enumValues[number])) {
    fieldErrors.businessType = "Choose a business type.";
  }
  if (!businessTaxStatusEnum.enumValues.includes(businessTaxStatus as typeof businessTaxStatusEnum.enumValues[number])) {
    fieldErrors.businessTaxStatus = "Choose a tax status (pick \"Not Applicable\" if unsure).";
  }
  if (!businessIndustry) fieldErrors.businessIndustry = "Tell us what industry you're in.";
  if (naicsCode && !/^\d{2,6}$/.test(naicsCode)) fieldErrors.naicsCode = "NAICS codes are 2 to 6 digits.";
  if (state && !US_STATES.has(state)) fieldErrors.state = "Choose a state.";
  if (zipCode && !/^\d{5}(-\d{4})?$/.test(zipCode)) fieldErrors.zipCode = "Enter a 5-digit ZIP code (or ZIP+4).";
  if (phone && phone.replace(/\D/g, '').length < 10) fieldErrors.phone = "Enter a 10-digit phone number.";
  if (logoFile) {
    if (logoFile.size > LOGO_MAX_BYTES) fieldErrors.logo = "Logo must be 5 MB or smaller.";
    else if (!logoFile.type.startsWith('image/')) fieldErrors.logo = "Upload an image file (PNG, JPG, SVG or WebP).";
  }
  if (materialsFile) {
    if (materialsFile.size > MATERIAL_MAX_BYTES) fieldErrors.businessMaterials = "File must be 10 MB or smaller.";
    else if (materialsFile.type && !MATERIAL_TYPES.has(materialsFile.type)) {
      fieldErrors.businessMaterials = "Upload a PDF, Word, PowerPoint, PNG or JPG file.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { message: "", error: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    let logoUrl: string | null = null;
    if (logoFile) {
      const safeName = logoFile.name.replace(/[^\w.-]+/g, '_');
      const blob = await put(`business-logos/${userId}/${Date.now()}-${safeName}`, logoFile, { access: 'public' });
      logoUrl = blob.url;
    }

    let businessMaterialsUrl: string | null = null;
    if (materialsFile) {
      const safeName = materialsFile.name.replace(/[^\w.-]+/g, '_');
      const blob = await put(`business-materials/${userId}/${Date.now()}-${safeName}`, materialsFile, { access: 'public' });
      businessMaterialsUrl = blob.url;
    }

    const newBusinessData: NewBusiness = {
      userId,
      ownerName,
      percentOwnership: percentOwnership.toString(),
      businessName,
      businessType: businessType as typeof businessTypeEnum.enumValues[number],
      businessTaxStatus: businessTaxStatus as typeof businessTaxStatusEnum.enumValues[number],
      businessDescription: businessDescription || null,
      businessIndustry,
      naicsCode: naicsCode || null,
      streetAddress: streetAddress || null,
      city: city || null,
      state: state || null,
      zipCode: zipCode || null,
      phone: phone || null,
      website: normalizeWebsite(website),
      logoUrl,
      businessMaterialsUrl,
      // Also surface the upload in the Materials tab so it isn't orphaned.
      material1Url: businessMaterialsUrl,
      material1Title: businessMaterialsUrl ? (materialsFile?.name ?? 'Business materials') : null,
    };

    const [created] = await db.insert(businesses).values(newBusinessData).returning({ id: businesses.id });

    await db.update(users).set({ hasBusinessProfile: true }).where(eq(users.id, userId));

    revalidatePath("/dashboard", "layout"); // sidebar lists businesses
    revalidatePath("/dashboard/businesses");
    return { message: `${businessName} has been added.`, error: "", businessId: created.id, businessName };
  } catch (error) {
    console.error("Error creating business profile:", error);
    return { message: "", error: "Something went wrong saving your business. Please try again." };
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
  if (!(await businessAccess(businessId))) {
    return { message: "", error: "You can only archive your own business." };
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
  if (isNaN(businessId)) {
    return { message: "", error: "Business ID is invalid." };
  }
  const owned = await db.query.businesses.findFirst({
    where: and(eq(businesses.id, businessId), eq(businesses.userId, userId)),
    columns: { id: true },
  });
  if (!owned) {
    return { message: "", error: "You can only edit your own business." };
  }
  const selectedGenderId = parseInt(formData.get("gender") as string);
  const selectedRaceId = parseInt(formData.get("race") as string);
  const selectedReligionId = parseInt(formData.get("religion") as string);
  const isTransgender = formData.get("isTransgender") === "true";
  const stateLocationId = parseInt(formData.get("stateLocationId") as string);
  const regionLocationId = parseInt(formData.get("regionLocationId") as string);
  const city = formData.get("city") as string;

  // Fetch Transgender demographic ID from the database
  const transgenderDemographic = await db.query.demographics.findFirst({ where: eq(demographics.name, 'Transgender') });

  const transgenderId = transgenderDemographic?.id;

  const newDemographicIds: (number | undefined)[] = [selectedGenderId, selectedRaceId, selectedReligionId];

  // Add Transgender ID if checked
  if (isTransgender && transgenderId) {
    newDemographicIds.push(transgenderId);
  }

  const dataToUpdate: { demographicIds?: number[] | null; stateLocationId?: number | null; regionLocationId?: number | null; city?: string | null } = {
    demographicIds: newDemographicIds.filter((id): id is number => id !== undefined && !isNaN(id)),
  };

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

  try {
    await db.update(businesses)
      .set(dataToUpdate)
      .where(eq(businesses.id, businessId));

    revalidatePath(`/dashboard/businesses/${businessId}`);
    return { message: "Details saved.", error: "" };
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
  if (!(await businessAccess(businessId))) {
    return { message: "", error: "You can only edit your own business." };
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
  const session = await getSession();
  if (!session?.user || !isStaff(session.user)) return []; // staff only
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

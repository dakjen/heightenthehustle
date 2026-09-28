'use server';

import { db } from "@/db";
import { businesses, businessTypeEnum, businessTaxStatusEnum, demographics, users, Business, BusinessWithLocation } from "@/db/schema";
import { eq, like, and } from "drizzle-orm";
import { getSession, SessionPayload } from "@/app/login/actions";
import { businessAccess, isStaff } from "@/lib/auth";
import { revalidatePath, unstable_noStore } from "next/cache";
import { chosenFile, checkUpload, uploadPublicFile } from "@/lib/uploads";
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
  const materialsFile = chosenFile(formData.get("businessMaterials"));
  const logoFile = chosenFile(formData.get("logo"));

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
    const problem = checkUpload(logoFile, "image");
    if (problem) fieldErrors.logo = problem;
  }
  if (materialsFile) {
    const problem = checkUpload(materialsFile, "material");
    if (problem) fieldErrors.businessMaterials = problem;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { message: "", error: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    const logoUrl = logoFile ? await uploadPublicFile(logoFile, 'business-logos', userId) : null;
    const businessMaterialsUrl = materialsFile
      ? await uploadPublicFile(materialsFile, 'business-materials', userId)
      : null;

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
  const businessId = parseInt(formData.get("businessId") as string);

  if (isNaN(businessId)) {
    return { message: "", error: "Business ID is invalid." };
  }
  const access = await businessAccess(businessId);
  if (!access) {
    return { message: "", error: "You can only edit your own business." };
  }

  // Check every chosen file before storing any of them, so a bad file in slot 4
  // doesn't leave slots 1-3 half-saved.
  const slots = [1, 2, 3, 4, 5].map((i) => ({
    i,
    file: chosenFile(formData.get(`material${i}`)),
    title: formData.get(`material${i}Title`) as string | null,
  }));

  const fieldErrors: Record<string, string> = {};
  for (const slot of slots) {
    if (!slot.file) continue;
    const problem = checkUpload(slot.file, "material");
    if (problem) fieldErrors[`material${slot.i}`] = problem;
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { message: "", error: "Please fix the highlighted files.", fieldErrors };
  }

  try {
    const updateData: Partial<InferInsertModel<typeof businesses>> & { [key: string]: string | number | boolean | undefined | null } = {};

    for (const slot of slots) {
      if (slot.file) {
        // Namespaced by the owner, never by the name the browser sent.
        updateData[`material${slot.i}Url`] = await uploadPublicFile(slot.file, "business-materials", access.user.id);
      }
      if (slot.title) {
        updateData[`material${slot.i}Title`] = slot.title;
      }
    }

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

"use server";

import { db } from "@/db";
import { businesses, businessTypeEnum, businessTaxStatusEnum } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { businessAccess } from "@/lib/auth";
import { checkUpload, chosenFile, uploadPublicFile } from "@/lib/uploads";
import { FormState } from "@/types/form-state";

function text(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

function normalizeWebsite(raw: string): string | null {
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return raw;
  }
}



export async function updateBusinessProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  const businessId = Number(text(formData, "businessId"));
  const access = await businessAccess(businessId);
  if (!access) {
    return { message: "", error: "You can only edit your own business." };
  }

  const businessName = text(formData, "businessName");
  const ownerName = text(formData, "ownerName");
  const percentRaw = text(formData, "percentOwnership");
  const percentOwnership = percentRaw === "" ? NaN : Number(percentRaw);
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
  const locationIdRaw = text(formData, "locationId");
  const logo = formData.get("logo");
  const photo = formData.get("businessProfilePhoto");

  const fieldErrors: Record<string, string> = {};
  if (!businessName) fieldErrors.businessName = "Enter your business name.";
  if (!ownerName) fieldErrors.ownerName = "Enter the owner's full name.";
  if (Number.isNaN(percentOwnership) || percentOwnership <= 0 || percentOwnership > 100) fieldErrors.percentOwnership = "Enter a percentage between 1 and 100.";
  if (!businessTypeEnum.enumValues.includes(businessType as typeof businessTypeEnum.enumValues[number])) fieldErrors.businessType = "Choose a business type.";
  if (!businessTaxStatusEnum.enumValues.includes(businessTaxStatus as typeof businessTaxStatusEnum.enumValues[number])) fieldErrors.businessTaxStatus = "Choose a tax status.";
  if (!businessIndustry) fieldErrors.businessIndustry = "Tell us what industry you're in.";
  if (naicsCode && !/^\d{2,6}$/.test(naicsCode)) fieldErrors.naicsCode = "NAICS codes are 2 to 6 digits.";
  if (state && !/^[A-Z]{2}$/.test(state)) fieldErrors.state = "Use the 2-letter state code.";
  if (zipCode && !/^\d{5}(-\d{4})?$/.test(zipCode)) fieldErrors.zipCode = "Enter a 5-digit ZIP code (or ZIP+4).";
  if (phone && phone.replace(/\D/g, "").length < 10) fieldErrors.phone = "Enter a 10-digit phone number.";
  for (const [name, value] of [["logo", logo], ["businessProfilePhoto", photo]] as const) {
    const file = chosenFile(value);
    if (!file) continue;
    const problem = checkUpload(file, "image");
    if (problem) fieldErrors[name] = problem;
  }
  if (Object.keys(fieldErrors).length) return { message: "", error: "Please fix the highlighted fields.", fieldErrors };

  try {
    const logoFile = chosenFile(logo);
    const photoFile = chosenFile(photo);
    // undefined means "nothing chosen": leave the existing image as it is.
    const logoUrl = logoFile ? await uploadPublicFile(logoFile, "business-logos", access.user.id) : undefined;
    const businessProfilePhotoUrl = photoFile
      ? await uploadPublicFile(photoFile, "business-photos", access.user.id)
      : undefined;

    await db
      .update(businesses)
      .set({
        businessName,
        ownerName,
        percentOwnership: percentOwnership.toString(),
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
        locationId: locationIdRaw ? Number(locationIdRaw) : null,
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(businessProfilePhotoUrl !== undefined ? { businessProfilePhotoUrl } : {}),
      })
      .where(eq(businesses.id, businessId));

    revalidatePath(`/dashboard/businesses/${businessId}`);
    revalidatePath("/dashboard", "layout");
    return { message: "Business profile saved.", error: "" };
  } catch (error) {
    console.error("Error updating business profile:", error);
    return { message: "", error: "Failed to save. Please try again." };
  }
}

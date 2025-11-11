'use server';

import { db } from '@/db';
import { businesses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { FormState } from "@/types/form-state";

export async function updateBusinessProfile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const businessId = formData.get('businessId') as string;
  const businessName = formData.get('businessName') as string;
  const ownerName = formData.get('ownerName') as string;
  const percentOwnership = parseFloat(formData.get('percentOwnership') as string);
  const businessType = formData.get('businessType') as typeof businesses.$inferInsert.businessType;
  const businessTaxStatus = formData.get('businessTaxStatus') as typeof businesses.$inferInsert.businessTaxStatus;
  const businessDescription = formData.get('businessDescription') as string;
  const businessIndustry = formData.get('businessIndustry') as string;
  const naicsCode = formData.get('naicsCode') as string;
  const streetAddress = formData.get('streetAddress') as string;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const zipCode = formData.get('zipCode') as string;
  const phone = formData.get('phone') as string;
  const website = formData.get('website') as string;

  if (!businessId) {
    return { message: "", error: 'Business ID is required.' };
  }

  try {
    await db
      .update(businesses)
      .set({
        businessName,
        ownerName,
        percentOwnership: percentOwnership.toString() as string,
        businessType,
        businessTaxStatus,
        businessDescription,
        businessIndustry,
        naicsCode,
        streetAddress,
        city,
        state,
        zipCode,
        phone,
        website,
      })
      .where(eq(businesses.id, parseInt(businessId)));

    revalidatePath(`/dashboard/businesses/${businessId}`);
    revalidatePath(`/dashboard/businesses/${businessId}/edit`);
    return { message: 'Business profile updated successfully!' };
  } catch (error) {
    console.error('Error updating business profile:', error);
    return { message: "", error: 'Failed to update business profile.' };
  }
}

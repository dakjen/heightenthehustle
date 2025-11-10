"use server";

import { db } from "@/db";
import { businesses, businessTypeEnum, businessTaxStatusEnum, users } from "@/db/schema";
import { eq, like, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface BusinessFilters {
  businessType?: string;
  businessTaxStatus?: string;
  isArchived?: boolean;
  includeOptedOut?: boolean;
}

export async function getAllBusinesses(searchQuery: string, filters: BusinessFilters) {
  const conditions = [];

  if (searchQuery) {
    conditions.push(like(businesses.businessName, `%${searchQuery}%`));
  }

  if (filters.businessType) {
    conditions.push(eq(businesses.businessType, filters.businessType as typeof businessTypeEnum.enumValues[number]));
  }

  if (filters.businessTaxStatus) {
    conditions.push(eq(businesses.businessTaxStatus, filters.businessTaxStatus as typeof businessTaxStatusEnum.enumValues[number]));
  }

  if (filters.isArchived === false) {
    conditions.push(eq(businesses.isArchived, false));
  } else if (filters.isArchived === true) {
    conditions.push(eq(businesses.isArchived, true));
  }

  if (!filters.includeOptedOut) {
    conditions.push(eq(users.isOptedOut, false));
  }

  const allBusinesses = await db.select({
    business: businesses,
    userEmail: users.email,
  })
  .from(businesses)
  .innerJoin(users, eq(businesses.userId, users.id))
  .where(and(...conditions));

  return allBusinesses;
}

export async function toggleBusinessArchiveStatus(businessId: number, newStatus: boolean) {
  try {
    await db.update(businesses)
      .set({ isArchived: newStatus })
      .where(eq(businesses.id, businessId));
    revalidatePath('/dashboard/admin/businesses'); // Revalidate the admin businesses page
    return { message: "Business archive status updated successfully!", error: "" };
  } catch (error) {
    console.error("Error toggling business archive status:", error);
    return { message: "", error: "Failed to update business archive status." };
  }
}

export async function deleteBusiness(businessId: number) {
  try {
    await db.delete(businesses)
      .where(eq(businesses.id, businessId));
    revalidatePath('/dashboard/admin/businesses'); // Revalidate the admin businesses page
    return { message: "Business deleted successfully!", error: "" };
  } catch (error) {
    console.error("Error deleting business:", error);
    return { message: "", error: "Failed to delete business." };
  }
}
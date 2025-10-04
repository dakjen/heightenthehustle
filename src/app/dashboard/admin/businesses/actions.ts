"use server";

import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq, like, and } from "drizzle-orm";

interface BusinessFilters {
  businessType?: string;
  businessTaxStatus?: string;
  isArchived?: boolean;
}

export async function getAllBusinesses(searchQuery: string, filters: BusinessFilters) {
  const conditions = [];

  if (searchQuery) {
    conditions.push(like(businesses.businessName, `%${searchQuery}%`));
  }

  if (filters.businessType) {
    conditions.push(eq(businesses.businessType, filters.businessType));
  }

  if (filters.businessTaxStatus) {
    conditions.push(eq(businesses.businessTaxStatus, filters.businessTaxStatus));
  }

  if (filters.isArchived !== undefined) {
    conditions.push(eq(businesses.isArchived, filters.isArchived));
  }

  const allBusinesses = await db.select().from(businesses).where(and(...conditions));
  return allBusinesses;
}
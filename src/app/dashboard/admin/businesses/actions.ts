"use server";

import { db } from "@/db";
import { businesses } from "@/db/schema";

export async function getAllBusinesses() {
  try {
    const allBusinesses = await db.query.businesses.findMany();
    return allBusinesses;
  } catch (error) {
    console.error("Error fetching all businesses for admin:", error);
    return [];
  }
}

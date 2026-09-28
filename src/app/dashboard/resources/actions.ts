"use server";

import { db } from "@/db";
import { resources, resourceCategoryEnum, type Resource } from "@/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { canAccessAdminArea, requireUser } from "@/lib/auth";
import { FormState } from "@/types/form-state";

function text(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

function checked(formData: FormData, name: string): boolean {
  const v = formData.get(name);
  return v === "on" || v === "true" || v === "1";
}

/** Auto-prepends https:// and validates. Returns null for empty, undefined for invalid. */
function normalizeUrl(raw: string): string | null | undefined {
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withScheme);
    if (!parsed.hostname.includes(".")) return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function parseTags(raw: string): string[] {
  return Array.from(new Set(raw.split(",").map((t) => t.trim()).filter(Boolean)));
}

function revalidate() {
  revalidatePath("/dashboard/resources");
  revalidatePath("/dashboard/admin/resources");
}

const ORDER = [
  desc(resources.isFeatured),
  sql`${resources.deadline} asc nulls last`,
  asc(resources.title),
];

// ---------- Member ----------

export async function getPublishedResources(): Promise<Resource[]> {
  try {
    return await db.query.resources.findMany({
      where: eq(resources.isPublished, true),
      orderBy: ORDER,
    });
  } catch (error) {
    console.error("getPublishedResources failed (run `npm run db:apply`?):", error);
    return [];
  }
}

// ---------- Admin ----------

export async function getAllResources(): Promise<Resource[]> {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) return [];
  try {
    return await db.query.resources.findMany({ orderBy: [desc(resources.updatedAt)] });
  } catch (error) {
    console.error("getAllResources failed (run `npm run db:apply`?):", error);
    return [];
  }
}

type ResourceInput = Omit<Resource, "id" | "createdById" | "createdAt" | "updatedAt">;

function parseResourceForm(formData: FormData): { data?: ResourceInput; fieldErrors?: Record<string, string> } {
  const category = text(formData, "category") as Resource["category"];
  const title = text(formData, "title");
  const description = text(formData, "description");
  const urlRaw = text(formData, "url");
  const provider = text(formData, "provider");
  const deadline = text(formData, "deadline");
  const discountCode = text(formData, "discountCode");
  const amount = text(formData, "amount");
  const tags = parseTags(text(formData, "tags"));

  const fieldErrors: Record<string, string> = {};
  if (!resourceCategoryEnum.enumValues.includes(category)) fieldErrors.category = "Choose a category.";
  if (!title) fieldErrors.title = "Give the resource a title.";
  const url = normalizeUrl(urlRaw);
  if (url === undefined) fieldErrors.url = "Enter a valid link (e.g. example.com/apply).";
  if (deadline && Number.isNaN(Date.parse(deadline))) fieldErrors.deadline = "Enter a valid date.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  return {
    data: {
      category,
      title,
      description: description || null,
      url: url ?? null,
      provider: provider || null,
      deadline: deadline ? new Date(`${deadline}T12:00:00`) : null,
      discountCode: discountCode || null,
      amount: amount || null,
      tags: tags.length ? tags : null,
      isPublished: checked(formData, "isPublished"),
      isFeatured: checked(formData, "isFeatured"),
    },
  };
}

export async function createResource(prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) return { message: "", error: "Unauthorized." };

  const { data, fieldErrors } = parseResourceForm(formData);
  if (!data) return { message: "", error: "Please fix the highlighted fields.", fieldErrors };

  try {
    await db.insert(resources).values({ ...data, createdById: user.id });
    revalidate();
    return { message: `"${data.title}" added.`, error: "" };
  } catch (error) {
    console.error("createResource failed:", error);
    return { message: "", error: "Something went wrong saving the resource. Please try again." };
  }
}

export async function updateResource(prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) return { message: "", error: "Unauthorized." };

  const id = Number(text(formData, "id"));
  if (!Number.isInteger(id) || id <= 0) return { message: "", error: "Missing resource id." };

  const { data, fieldErrors } = parseResourceForm(formData);
  if (!data) return { message: "", error: "Please fix the highlighted fields.", fieldErrors };

  try {
    const updated = await db
      .update(resources)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning({ id: resources.id });
    if (!updated.length) return { message: "", error: "That resource no longer exists." };
    revalidate();
    return { message: `"${data.title}" saved.`, error: "" };
  } catch (error) {
    console.error("updateResource failed:", error);
    return { message: "", error: "Something went wrong saving the resource. Please try again." };
  }
}

export async function deleteResource(id: number): Promise<FormState> {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) return { message: "", error: "Unauthorized." };
  if (!Number.isInteger(id) || id <= 0) return { message: "", error: "Missing resource id." };
  try {
    await db.delete(resources).where(eq(resources.id, id));
    revalidate();
    return { message: "Deleted.", error: "" };
  } catch (error) {
    console.error("deleteResource failed:", error);
    return { message: "", error: "Failed to delete." };
  }
}

export async function toggleResource(id: number, patch: { isPublished?: boolean; isFeatured?: boolean }): Promise<FormState> {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) return { message: "", error: "Unauthorized." };
  if (!Number.isInteger(id) || id <= 0) return { message: "", error: "Missing resource id." };
  const set: { isPublished?: boolean; isFeatured?: boolean } = {};
  if (typeof patch.isPublished === "boolean") set.isPublished = patch.isPublished;
  if (typeof patch.isFeatured === "boolean") set.isFeatured = patch.isFeatured;
  if (!Object.keys(set).length) return { message: "", error: "Nothing to change." };
  try {
    await db.update(resources).set({ ...set, updatedAt: new Date() }).where(eq(resources.id, id));
    revalidate();
    return { message: "Saved.", error: "" };
  } catch (error) {
    console.error("toggleResource failed:", error);
    return { message: "", error: "Failed to save." };
  }
}

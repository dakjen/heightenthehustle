"use server";

import { db } from "@/db";
import { documents, documentKindEnum, businesses, type SecureDocument } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/login/actions";
import { canAccessAdminArea, requireUser } from "@/lib/auth";
import { FormState } from "@/types/form-state";
import { DOCUMENT_MAX_BYTES, DOCUMENT_TYPES } from "./constants";

function text(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

export type DocumentWithMeta = SecureDocument & {
  owner: { id: number; name: string; email: string };
  business: { id: number; businessName: string } | null;
};

/** Documents the signed-in member owns. */
export async function getMyDocuments(): Promise<DocumentWithMeta[]> {
  const session = await getSession();
  if (!session?.user) return [];
  try {
    return await db.query.documents.findMany({
      where: eq(documents.ownerId, session.user.id),
      orderBy: [desc(documents.createdAt)],
      with: {
        owner: { columns: { id: true, name: true, email: true } },
        business: { columns: { id: true, businessName: true } },
      },
    });
  } catch (error) {
    console.error("getMyDocuments failed (run `npm run db:apply`?):", error);
    return [];
  }
}

/** Every member document, for the admin view. */
export async function getAllDocuments(): Promise<DocumentWithMeta[]> {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) return [];
  try {
    return await db.query.documents.findMany({
      orderBy: [desc(documents.createdAt)],
      with: {
        owner: { columns: { id: true, name: true, email: true } },
        business: { columns: { id: true, businessName: true } },
      },
    });
  } catch (error) {
    console.error("getAllDocuments failed (run `npm run db:apply`?):", error);
    return [];
  }
}

/**
 * Upload a document to PRIVATE blob storage. The blob pathname is stored server-side only;
 * downloads go through /api/documents/[id], which checks the caller is the owner or an admin.
 * Admins may upload on a member's behalf by passing ownerId.
 */
export async function uploadDocument(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session?.user) return { message: "", error: "Please sign in again." };
  const me = session.user;

  const kind = text(formData, "kind") as SecureDocument["kind"];
  const title = text(formData, "title");
  const notes = text(formData, "notes");
  const businessIdRaw = text(formData, "businessId");
  const ownerIdRaw = text(formData, "ownerId");
  const file = formData.get("file");

  // Who will own this document?
  let ownerId = me.id;
  if (ownerIdRaw && Number(ownerIdRaw) !== me.id) {
    if (!canAccessAdminArea(me)) return { message: "", error: "You can only upload your own documents." };
    ownerId = Number(ownerIdRaw);
  }

  const fieldErrors: Record<string, string> = {};
  if (!documentKindEnum.enumValues.includes(kind)) fieldErrors.kind = "Choose a document type.";
  if (!title) fieldErrors.title = "Give the document a name.";
  if (!(file instanceof File) || file.size === 0) {
    fieldErrors.file = "Choose a file to upload.";
  } else {
    if (file.size > DOCUMENT_MAX_BYTES) fieldErrors.file = "File must be 15 MB or smaller.";
    else if (file.type && !DOCUMENT_TYPES.has(file.type)) fieldErrors.file = "Upload a PDF, Word, Excel, PowerPoint, PNG or JPG file.";
  }
  if (Object.keys(fieldErrors).length) return { message: "", error: "Please fix the highlighted fields.", fieldErrors };
  const upload = file as File;

  let businessId: number | null = null;
  if (businessIdRaw) {
    const owned = await db.query.businesses.findFirst({
      where: and(eq(businesses.id, Number(businessIdRaw)), eq(businesses.userId, ownerId)),
      columns: { id: true },
    });
    if (!owned) return { message: "", error: "That business doesn't belong to this member." };
    businessId = owned.id;
  }

  try {
    const safeName = upload.name.replace(/[^\w.-]+/g, "_");
    const pathname = `documents/${ownerId}/${Date.now()}-${safeName}`;
    const blob = await put(pathname, upload, { access: "private", addRandomSuffix: true });

    await db.insert(documents).values({
      ownerId,
      businessId,
      kind,
      title,
      fileName: upload.name,
      contentType: upload.type || "application/octet-stream",
      sizeBytes: upload.size,
      blobPathname: blob.pathname,
      notes: notes || null,
      uploadedById: me.id,
    });

    revalidatePath("/dashboard/documents");
    revalidatePath("/dashboard/admin/documents");
    return { message: `${title} uploaded securely.`, error: "" };
  } catch (error) {
    console.error("uploadDocument failed:", error);
    return { message: "", error: "Upload failed. Please try again." };
  }
}

/** Owner or admin can delete. Removes the blob too. */
export async function deleteDocument(id: number): Promise<FormState> {
  const session = await getSession();
  if (!session?.user) return { message: "", error: "Please sign in again." };
  const me = session.user;

  const doc = await db.query.documents.findFirst({ where: eq(documents.id, id) });
  if (!doc) return { message: "", error: "Document not found." };
  if (doc.ownerId !== me.id && !canAccessAdminArea(me)) return { message: "", error: "Not allowed." };

  try {
    await del(doc.blobPathname);
  } catch (error) {
    console.warn("Blob delete failed (continuing to remove record):", error);
  }
  await db.delete(documents).where(eq(documents.id, id));
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/admin/documents");
  return { message: "Document deleted.", error: "" };
}

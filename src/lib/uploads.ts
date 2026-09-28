/**
 * Public file uploads (logos, photos, business materials, class syllabi).
 *
 * Every public upload goes through here so three rules always hold:
 *  - the file type and size are checked against an allowlist before anything
 *    is stored;
 *  - the blob key is built server-side as `folder/ownerId/timestamp-name`, so
 *    one member can never write into another member's space;
 *  - uploads never overwrite. A repeated file name gets a new key instead of
 *    replacing whatever was there before.
 *
 * Anything sensitive (W-9s, financials, IDs) does not belong here — that goes
 * to private storage via `src/app/dashboard/documents/actions.ts`.
 */
import { put } from "@vercel/blob";

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const MATERIAL_MAX_BYTES = 10 * 1024 * 1024; // 10 MB, matches next.config serverActions bodySizeLimit

/**
 * SVG is deliberately absent: it can carry script, and these files are served
 * from a domain where that script would run.
 */
export const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]);

export const MATERIAL_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
]);

export type UploadKind = "image" | "material";

const RULES: Record<UploadKind, { types: Set<string>; maxBytes: number; message: string; sizeMessage: string }> = {
  image: {
    types: IMAGE_TYPES,
    maxBytes: IMAGE_MAX_BYTES,
    message: "Upload a PNG, JPG, WebP or GIF image.",
    sizeMessage: "Image must be 5 MB or smaller.",
  },
  material: {
    types: MATERIAL_TYPES,
    maxBytes: MATERIAL_MAX_BYTES,
    message: "Upload a PDF, Word, Excel, PowerPoint, PNG or JPG file.",
    sizeMessage: "File must be 10 MB or smaller.",
  },
};

/** A file the user actually chose, or null. Empty file inputs post a zero-byte File. */
export function chosenFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size > 0 ? value : null;
}

/** Returns a message to show the user, or null when the file is acceptable. */
export function checkUpload(file: File, kind: UploadKind): string | null {
  const rule = RULES[kind];
  if (file.size > rule.maxBytes) return rule.sizeMessage;
  if (!rule.types.has(file.type)) return rule.message;
  return null;
}

/**
 * Store a file in public blob storage under a key we control.
 *
 * `folder` is a fixed string from the calling code (never user input) and
 * `ownerId` scopes the file to one user. The caller must have run
 * `checkUpload` first.
 */
export async function uploadPublicFile(file: File, folder: string, ownerId: number): Promise<string> {
  const safeName = file.name.replace(/[^\w.-]+/g, "_").slice(-100);
  const blob = await put(`${folder}/${ownerId}/${Date.now()}-${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}

/**
 * Validate and upload one optional form file.
 *
 * Returns the new URL, `undefined` when nothing was chosen (leave the existing
 * value alone), or `{ error }` when the file is not acceptable.
 */
export async function uploadOptionalFile(
  value: FormDataEntryValue | null,
  kind: UploadKind,
  folder: string,
  ownerId: number,
): Promise<{ url?: string; error?: string }> {
  const file = chosenFile(value);
  if (!file) return {};
  const error = checkUpload(file, kind);
  if (error) return { error };
  return { url: await uploadPublicFile(file, folder, ownerId) };
}

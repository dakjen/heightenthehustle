/**
 * Direct-to-storage uploads.
 *
 * Files sent through a server action are capped by the host at about 4.5 MB
 * (the request fails with HTTP 413). For anything that can be bigger, the
 * browser uploads straight to blob storage with a short-lived token from
 * /api/blob/upload, then the form posts a small reference to the stored file
 * instead of the file itself. `claimUpload()` turns that reference back into a
 * verified file on the server.
 *
 * Every upload lands under `uploads/<kind>/<userId>/`, so a user can only ever
 * claim files they uploaded themselves.
 */
import { head, del } from "@vercel/blob";
import type { UserSession } from "@/lib/session";
import { hasPermission } from "@/lib/auth";
import { chosenFile, checkUpload, uploadPublicFile, type UploadKind } from "@/lib/uploads";

export type DirectKind = "document" | "submission" | "course-material" | "business-material" | "image";

const MB = 1024 * 1024;

/** Photos and logos. No SVG: it can carry script and these are served publicly. */
const IMAGES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif", "image/heic", "image/heif"];

/** Documents, spreadsheets, decks, plain text, archives, audio and video. */
const FILES = [
  ...IMAGES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.*",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.oasis.opendocument.*",
  "application/vnd.apple.*",
  "application/x-iwork-*",
  "application/rtf",
  "application/zip",
  "application/x-zip-compressed",
  "application/epub+zip",
  "application/json",
  "text/plain",
  "text/csv",
  "text/markdown",
  "text/rtf",
  "audio/*",
  "video/*",
];

interface KindRule {
  access: "public" | "private";
  maxBytes: number;
  types: string[];
  /** Staff permission required to upload this kind. */
  permission?: "canManageClasses";
}

export const DIRECT_KINDS: Record<DirectKind, KindRule> = {
  image: { access: "public", maxBytes: 25 * MB, types: IMAGES },
  document: { access: "private", maxBytes: 250 * MB, types: FILES },
  submission: { access: "private", maxBytes: 250 * MB, types: FILES },
  "business-material": { access: "public", maxBytes: 250 * MB, types: FILES },
  "course-material": { access: "public", maxBytes: 1024 * MB, types: FILES, permission: "canManageClasses" },
};

/** True when `type` matches one of `allowed`, where entries may end in `*` (e.g. "video/*"). */
function typeAllowed(type: string, allowed: string[]): boolean {
  const t = type.split(";")[0].trim().toLowerCase();
  return allowed.some((a) => (a.endsWith("*") ? t.startsWith(a.slice(0, -1)) : t === a));
}

export function isDirectKind(value: unknown): value is DirectKind {
  return typeof value === "string" && value in DIRECT_KINDS;
}

export function directPrefix(kind: DirectKind, userId: number): string {
  return `uploads/${kind}/${userId}/`;
}

export function mayUpload(user: UserSession, kind: DirectKind): boolean {
  const need = DIRECT_KINDS[kind].permission;
  return need ? hasPermission(user, need) : true;
}

export interface ClaimedUpload {
  pathname: string;
  url: string;
  size: number;
  contentType: string;
  fileName: string;
}

/**
 * Reads the `<field>__blob` reference a direct-upload form posts and verifies it.
 * Returns null when the form didn't use a direct upload for that field,
 * `{ error }` when the reference is not acceptable, or the stored file's details
 * (size and type come from storage, never from the browser).
 */
export async function claimUpload(formData: FormData, field: string, kind: DirectKind, userId: number): Promise<ClaimedUpload | { error: string } | null> {
  const raw = formData.get(`${field}__blob`);
  if (typeof raw !== "string" || !raw) return null;

  let ref: { pathname?: unknown; name?: unknown };
  try {
    ref = JSON.parse(raw);
  } catch {
    return { error: "Upload reference was not understood. Please try again." };
  }
  const pathname = typeof ref.pathname === "string" ? ref.pathname : "";
  if (!pathname.startsWith(directPrefix(kind, userId)) || pathname.includes("..")) {
    return { error: "That upload doesn't belong to you. Please try again." };
  }

  const rule = DIRECT_KINDS[kind];
  try {
    const meta = await head(pathname);
    if (meta.size > rule.maxBytes || (meta.contentType && !typeAllowed(meta.contentType, rule.types))) {
      await del(pathname).catch(() => undefined);
      return { error: meta.size > rule.maxBytes ? `File must be ${Math.round(rule.maxBytes / MB)} MB or smaller.` : "That file type isn't accepted here." };
    }
    const fileName = typeof ref.name === "string" && ref.name ? ref.name.slice(0, 200) : pathname.split("/").pop() ?? "file";
    return { pathname: meta.pathname, url: meta.url, size: meta.size, contentType: meta.contentType || "application/octet-stream", fileName };
  } catch (error) {
    console.error("claimUpload: could not verify upload:", error);
    return { error: "We couldn't find the uploaded file. Please try again." };
  }
}

export function isClaimError(v: ClaimedUpload | { error: string } | null): v is { error: string } {
  return Boolean(v && "error" in v);
}

// ---------- Public files (logos, photos, materials): direct upload first, form file as fallback ----------


export type PreparedUpload = { error: string } | { claimed: ClaimedUpload } | { file: File } | null;

/**
 * Looks for a file on `field`: a verified direct upload if the form used one,
 * otherwise a small file sent with the form. Nothing is stored yet for the
 * form-file case, so call this while validating and `storePrepared()` after.
 */
export async function prepareUpload(formData: FormData, field: string, directKind: DirectKind, legacyKind: UploadKind, userId: number): Promise<PreparedUpload> {
  const claimed = await claimUpload(formData, field, directKind, userId);
  if (isClaimError(claimed)) return claimed;
  if (claimed) return { claimed };
  const file = chosenFile(formData.get(field));
  if (!file) return null;
  const problem = checkUpload(file, legacyKind);
  return problem ? { error: problem } : { file };
}

export function preparedError(p: PreparedUpload): string | null {
  return p && "error" in p ? p.error : null;
}

/** Public URL (and original file name) for a prepared upload, or undefined when no file was chosen. */
export async function storePrepared(p: PreparedUpload, folder: string, userId: number): Promise<{ url: string; fileName: string } | undefined> {
  if (!p || "error" in p) return undefined;
  if ("claimed" in p) return { url: p.claimed.url, fileName: p.claimed.fileName };
  return { url: await uploadPublicFile(p.file, folder, userId), fileName: p.file.name };
}

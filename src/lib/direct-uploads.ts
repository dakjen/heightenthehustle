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

export type DirectKind = "document" | "submission" | "course-material" | "business-material";

const MB = 1024 * 1024;
const OFFICE = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
];

interface KindRule {
  access: "public" | "private";
  maxBytes: number;
  types: string[];
  /** Staff permission required to upload this kind. */
  permission?: "canManageClasses";
}

export const DIRECT_KINDS: Record<DirectKind, KindRule> = {
  document: { access: "private", maxBytes: 25 * MB, types: OFFICE },
  submission: { access: "private", maxBytes: 25 * MB, types: OFFICE },
  "business-material": { access: "public", maxBytes: 25 * MB, types: OFFICE },
  "course-material": { access: "public", maxBytes: 100 * MB, types: [...OFFICE, "application/zip", "video/mp4", "text/plain", "text/csv"], permission: "canManageClasses" },
};

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
    if (meta.size > rule.maxBytes || (meta.contentType && !rule.types.includes(meta.contentType.split(";")[0]))) {
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

import { documentKindEnum } from "@/db/schema";

export const DOCUMENT_KINDS = documentKindEnum.enumValues;
export const DOCUMENT_MAX_BYTES = 15 * 1024 * 1024; // 15 MB
export const DOCUMENT_ACCEPT = ""; // any file type the storage rules allow (see src/lib/direct-uploads.ts)
export const DOCUMENT_TYPES = new Set([
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

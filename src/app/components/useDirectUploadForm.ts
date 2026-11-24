"use client";

import { useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import type { DirectKind } from "@/lib/direct-uploads";

const MB = 1024 * 1024;
/** Files up to this size also fit through a normal form post (the host caps requests near 4.5 MB). */
const SERVER_SAFE_BYTES = 3.5 * MB;
class TooLarge extends Error {}

/**
 * Form submit handler that uploads chosen files straight to storage before
 * calling the server action, so large files never pass through the server
 * (which rejects requests over ~4.5 MB with a 413).
 *
 *   const { onSubmit, busy, progress, uploadError } = useDirectUploadForm(formAction, { file: "document" });
 *   <form onSubmit={onSubmit}> ... <SubmitButton busy={busy} />
 *
 * Each listed file field is replaced in the posted data by `<field>__blob`,
 * a small reference the action verifies with `claimUpload()`.
 */
export function useDirectUploadForm(formAction: (formData: FormData) => void, fields: Record<string, DirectKind>) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [pending, startTransition] = useTransition();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setUploadError("");
    setUploading(true);
    try {
      for (const [name, kind] of Object.entries(fields)) {
        const file = formData.get(name);
        formData.delete(name);
        if (!(file instanceof File) || file.size === 0) continue;

        try {
          const res = await fetch(`/api/blob/upload?kind=${encodeURIComponent(kind)}`);
          if (!res.ok) throw new Error(res.status === 401 ? "Your session expired. Please sign in again." : "You can't upload here.");
          const info = (await res.json()) as { prefix: string; access: "public" | "private"; maxBytes: number };
          if (file.size > info.maxBytes) throw new TooLarge(`"${file.name}" is too large. The limit is ${Math.round(info.maxBytes / MB)} MB.`);

          const safeName = file.name.replace(/[^\w.-]+/g, "_").slice(-100);
          const blob = await upload(`${info.prefix}${Date.now()}-${safeName}`, file, {
            access: info.access,
            handleUploadUrl: "/api/blob/upload",
            clientPayload: kind,
            multipart: file.size > 20 * MB,
            onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
          });
          formData.set(`${name}__blob`, JSON.stringify({ pathname: blob.pathname, name: file.name }));
        } catch (error) {
          // Small files can still travel with the form itself, so a hiccup in the
          // direct upload never blocks them. Big ones have no other route.
          if (error instanceof TooLarge || file.size > SERVER_SAFE_BYTES) throw error;
          console.warn("Direct upload failed; sending the file with the form instead.", error);
          formData.set(name, file);
        }
      }
      setProgress(null);
      startTransition(() => formAction(formData));
    } catch (error) {
      setProgress(null);
      setUploadError(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return { onSubmit, busy: uploading || pending, progress, uploadError };
}

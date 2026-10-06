"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CourseAttachment } from "@/db/schema";
import { uploadAttachment, deleteAttachment } from "@/app/dashboard/hth-class/course-actions";
import { FormState } from "@/types/form-state";
import { Field, SubmitButton, FormError, FormSuccess, inputClass, fileInputClass, invalidProps } from "@/app/components/form";

function size(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  classId: number;
  lessonId?: number;
  attachments: CourseAttachment[];
}

/** Upload + list templates/documents for a course (no lessonId) or a lesson. */
export default function AttachmentsPanel({ classId, lessonId, attachments }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(uploadAttachment, { message: "" });
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const last = useRef<FormState | null>(null);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state === last.current) return;
    last.current = state;
    if (state.message && !state.error) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <section className="hth-card p-6">
      <h3 className="text-2xl text-gray-900">{lessonId ? "Lesson downloads & templates" : "Course downloads & templates"}</h3>
      <p className="mb-4 text-sm text-gray-600">
        {lessonId ? "Worksheets, templates or slides for this lesson. Members see them under the lesson." : "Files for the whole course, like the Lean Canvas template. Members see them on the course page."}
      </p>

      {attachments.length > 0 && (
        <ul className="mb-5 divide-y divide-gray-100 rounded-lg border border-gray-200">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#2b2b2b] text-[10px] font-bold uppercase text-white">{a.fileName.split(".").pop()?.slice(0, 4)}</span>
              <span className="min-w-0 flex-1">
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="block truncate font-semibold text-gray-900 hover:text-[#910000]">{a.title}</a>
                <span className="block text-xs text-gray-500">{a.fileName} · {size(a.sizeBytes)}</span>
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => { if (confirm(`Remove "${a.title}"?`)) start(async () => { const r = await deleteAttachment(a.id); setMsg(r.error || r.message); router.refresh(); }); }}
                className="text-xs font-semibold text-red-700 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {msg && <p className="mb-3 text-sm text-gray-600">{msg}</p>}

      <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" noValidate>
        <input type="hidden" name="classId" value={classId} />
        {lessonId && <input type="hidden" name="lessonId" value={lessonId} />}
        <Field name="title" label="Title" hideOptional hint="Leave blank to use the file name.">
          <input id="title" name="title" type="text" placeholder="e.g. List of Services Template" className={inputClass} />
        </Field>
        <Field name="file" label="File" required error={errors.file} hint="Up to 25 MB.">
          <input id="file" name="file" type="file" required className={fileInputClass} {...invalidProps("file", errors)} />
        </Field>
        <div className="pb-1">
          <SubmitButton pendingText="Uploading…">Upload</SubmitButton>
        </div>
        <div className="sm:col-span-3">
          <FormError message={state.error} />
          <FormSuccess message={state.message && !state.error ? state.message : undefined} />
        </div>
      </form>
    </section>
  );
}

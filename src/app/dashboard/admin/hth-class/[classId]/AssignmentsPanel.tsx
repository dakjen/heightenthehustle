"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Assignment } from "@/db/schema";
import { saveAssignment, deleteAssignment } from "@/app/dashboard/hth-class/assignment-actions";
import { FormState } from "@/types/form-state";
import { Field, FormSection, SubmitButton, FormError, FormSuccess, inputClass, checkboxClass, secondaryButtonClass, ghostButtonClass, invalidProps } from "@/app/components/form";
import Markdown from "@/app/components/Markdown";

/** Assignments as the admin list returns them; counts are optional so the panel also works with plain rows. */
export type AdminAssignment = Assignment & { lessonTitle?: string | null; submissionCount?: number; ungradedCount?: number };

const dueFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** yyyy-mm-dd in local time for a <input type="date">. */
function toDateInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDue(d: Date | string | null | undefined): string {
  if (!d) return "No due date";
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? "No due date" : `Due ${dueFmt.format(date)}`;
}

function PublishedChip({ published }: { published: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
      {published ? "Published" : "Draft"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Add / edit form
// ---------------------------------------------------------------------------

function AssignmentForm({ classId, lessonId, assignment, onDone }: { classId: number; lessonId?: number; assignment: AdminAssignment | null; onDone: () => void }) {
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(saveAssignment, { message: "" });
  const errors = state.fieldErrors ?? {};
  const [instructions, setInstructions] = useState(assignment?.instructions ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [allowsText, setAllowsText] = useState(assignment?.allowsText ?? true);
  const [allowsFile, setAllowsFile] = useState(assignment?.allowsFile ?? true);
  const [published, setPublished] = useState(assignment?.isPublished ?? true);
  const last = useRef<FormState | null>(null);

  useEffect(() => {
    if (state === last.current) return;
    last.current = state;
    if (state.message && !state.error) {
      router.refresh();
      onDone();
    }
  }, [state, router, onDone]);

  return (
    <form action={formAction} noValidate>
      {assignment && <input type="hidden" name="id" value={assignment.id} />}
      <input type="hidden" name="classId" value={classId} />
      {/* Keep an existing assignment on its lesson; new ones go on the lesson this panel belongs to. */}
      <input type="hidden" name="lessonId" value={assignment ? assignment.lessonId ?? "" : lessonId ?? ""} />
      <input type="hidden" name="allowsText" value={allowsText ? "on" : "off"} />
      <input type="hidden" name="allowsFile" value={allowsFile ? "on" : "off"} />
      <input type="hidden" name="isPublished" value={published ? "on" : "off"} />

      <FormSection title={assignment ? "Edit assignment" : "New assignment"} description="Members see published assignments with the lesson (or on the course page for course-level homework).">
        <Field name="title" label="Title" required error={errors.title} className="sm:col-span-2">
          <input id="title" name="title" type="text" required defaultValue={assignment?.title ?? ""} placeholder="e.g. Draft your Lean Canvas" className={inputClass} {...invalidProps("title", errors)} />
        </Field>

        <div className="sm:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-800">
              Instructions <span className="ml-1 text-xs font-normal text-gray-400">Markdown, optional</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              aria-pressed={showPreview}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${showPreview ? "bg-[#910000] text-white" : "border border-gray-300 bg-white text-gray-700"}`}
            >
              {showPreview ? "Hide preview" : "Preview"}
            </button>
          </div>
          <div className={`mt-1 grid gap-4 ${showPreview ? "lg:grid-cols-2" : ""}`}>
            <textarea
              id="instructions"
              name="instructions"
              rows={8}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={"What should members hand in? Use **bold**, lists, and [links](https://)."}
              className={`${inputClass} min-h-[12rem] font-mono text-sm leading-relaxed`}
              {...invalidProps("instructions", errors)}
            />
            {showPreview && (
              <div className="min-h-[12rem] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                {instructions.trim() ? <Markdown content={instructions} /> : <p className="text-sm text-gray-400">Nothing to preview yet.</p>}
              </div>
            )}
          </div>
          {errors.instructions && <p className="mt-1 text-sm text-red-700">{errors.instructions}</p>}
        </div>

        <Field name="dueDate" label="Due date" error={errors.dueDate} hint="Due at the end of that day.">
          <input id="dueDate" name="dueDate" type="date" defaultValue={toDateInput(assignment?.dueDate)} className={inputClass} {...invalidProps("dueDate", errors)} />
        </Field>
        <Field name="points" label="Points" error={errors.points} hint="Leave blank for pass/fail.">
          <input id="points" name="points" type="text" inputMode="numeric" pattern="\d{1,4}" defaultValue={assignment?.points ?? ""} placeholder="10" className={inputClass} {...invalidProps("points", errors)} />
        </Field>

        <fieldset className="space-y-2 sm:col-span-2">
          <legend className="text-sm font-medium text-gray-800">How members respond</legend>
          <label className="flex items-center gap-3 text-sm text-gray-800">
            <input type="checkbox" checked={allowsText} onChange={(e) => setAllowsText(e.target.checked)} className={checkboxClass} />
            Allow written answer
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-800">
            <input type="checkbox" checked={allowsFile} onChange={(e) => setAllowsFile(e.target.checked)} className={checkboxClass} />
            Allow file upload
          </label>
          {errors.allowsText && <p className="text-sm text-red-700">{errors.allowsText}</p>}
        </fieldset>

        <label className="flex items-center gap-3 text-sm text-gray-800 sm:col-span-2">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className={checkboxClass} />
          Published (visible to enrolled members)
        </label>

        <div className="space-y-3 sm:col-span-2">
          <FormError message={state.error} />
          <FormSuccess message={state.message && !state.error ? state.message : undefined} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <SubmitButton pendingText="Saving…">{assignment ? "Save assignment" : "Add assignment"}</SubmitButton>
            <button type="button" onClick={onDone} className={ghostButtonClass}>Cancel</button>
          </div>
        </div>
      </FormSection>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

interface Props {
  classId: number;
  /** Omit for course-level assignments. */
  lessonId?: number;
  assignments: AdminAssignment[];
}

/** List + add/edit/delete homework for a lesson (or the whole course when lessonId is omitted). */
export default function AssignmentsPanel({ classId, lessonId, assignments }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  const remove = (a: AdminAssignment) => {
    const n = a.submissionCount ?? 0;
    if (!confirm(`Delete "${a.title}"?${n ? ` ${n} submission${n === 1 ? "" : "s"} will be deleted too.` : ""}`)) return;
    start(async () => {
      const r = await deleteAssignment(a.id);
      setMsg(r.error || r.message);
      router.refresh();
    });
  };

  return (
    <section className="hth-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl text-gray-900">{lessonId ? "Lesson homework" : "Course homework"}</h3>
          <p className="text-sm text-gray-600">
            {lessonId ? "Assignments members complete for this lesson." : "Assignments for the whole course, not tied to a single lesson."}
          </p>
        </div>
        {editing === null && (
          <button type="button" onClick={() => { setMsg(""); setEditing("new"); }} className={`${secondaryButtonClass} py-2 text-sm`}>+ Add assignment</button>
        )}
      </div>

      {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}

      {assignments.length === 0 && editing !== "new" ? (
        <p className="mt-4 text-sm text-gray-500">No assignments yet.</p>
      ) : assignments.length > 0 ? (
        <ul className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200">
          {assignments.map((a) => (
            <li key={a.id} className="px-4 py-3">
              {editing === a.id ? (
                <AssignmentForm classId={classId} lessonId={lessonId} assignment={a} onDone={() => setEditing(null)} />
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{a.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <PublishedChip published={a.isPublished} />
                      <span>{formatDue(a.dueDate)}</span>
                      <span>· {a.points != null ? `${a.points} pts` : "Pass/fail"}</span>
                      {a.submissionCount != null && (
                        <span>
                          · {a.submissionCount} submission{a.submissionCount === 1 ? "" : "s"}
                          {a.ungradedCount ? <span className="ml-1 rounded-full bg-[#910000]/10 px-2 py-0.5 font-semibold text-[#910000]">{a.ungradedCount} to grade</span> : null}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" disabled={pending} onClick={() => { setMsg(""); setEditing(a.id); }} className="rounded-lg border-2 border-[#910000] px-3 py-1.5 text-sm font-semibold text-[#910000] hover:bg-[#910000] hover:text-white">Edit</button>
                    <button type="button" disabled={pending} onClick={() => remove(a)} className="rounded-lg px-2 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {editing === "new" && (
        <div className="mt-4">
          <AssignmentForm classId={classId} lessonId={lessonId} assignment={null} onDone={() => setEditing(null)} />
        </div>
      )}
    </section>
  );
}

"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Markdown from "@/app/components/Markdown";
import { Field, FormError, FormSuccess, SubmitButton, fileInputClass, inputClass, secondaryButtonClass } from "@/app/components/form";
import type { FormState } from "@/types/form-state";
import { submitAssignment, type MemberAssignment } from "./assignment-actions";
import { AssignmentStatusChip, assignmentState, formatShortDate, scoreLabel } from "./course-ui";

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg";
const initialState: FormState = { message: "", error: "" };

/** Like form.tsx's invalidProps, but keyed by a per-card element id so several cards on one page don't collide. */
function invalid(id: string, error?: string) {
  return error ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {};
}

interface AssignmentCardProps {
  assignment: MemberAssignment;
  courseId: number;
}

/** One homework assignment: instructions, current status/feedback, and the submit (or resubmit) form. */
export default function AssignmentCard({ assignment, courseId }: AssignmentCardProps) {
  const router = useRouter();
  const state = assignmentState(assignment);
  const sub = assignment.submission;
  const [formState, action] = useActionState(submitAssignment, initialState);
  // Returned work opens the form by default; submitted/graded work hides it behind "Resubmit".
  const [showForm, setShowForm] = useState(state === "none" || state === "overdue" || state === "returned");

  useEffect(() => {
    if (formState.message) {
      setShowForm(false);
      router.refresh();
    }
  }, [formState, router]);

  const errors = formState.fieldErrors;
  const score = scoreLabel(assignment);
  const formId = `assignment-${assignment.id}`;
  const fileHref = sub?.fileName ? `/api/submissions/${sub.id}/file` : null;

  return (
    <article className="hth-card p-5 sm:p-6" data-course={courseId} aria-labelledby={`${formId}-title`}>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 id={`${formId}-title`} className="text-2xl leading-tight text-gray-900">{assignment.title}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            {assignment.dueDate && (
              <span className={state === "overdue" ? "font-semibold text-red-700" : ""}>
                {state === "overdue" ? "Overdue" : `Due ${formatShortDate(assignment.dueDate)}`}
              </span>
            )}
            {assignment.points != null && <span>{assignment.points} pt{assignment.points === 1 ? "" : "s"}</span>}
          </p>
        </div>
        <AssignmentStatusChip assignment={assignment} className="self-start" />
      </header>

      {assignment.instructions && (
        <div className="mt-4">
          <Markdown content={assignment.instructions} />
        </div>
      )}

      {/* Teacher feedback */}
      {sub && (sub.feedback || score) && (
        <div className={`mt-4 rounded-xl border px-4 py-3 ${state === "returned" ? "border-amber-200 bg-amber-50" : "border-[#910000]/20 bg-[#910000]/5"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            {state === "returned" ? "Your teacher asked for a revision" : "Teacher feedback"}
            {sub.gradedAt ? ` · ${formatShortDate(sub.gradedAt)}` : ""}
          </p>
          {score && <p className="mt-1 font-display text-3xl leading-none text-[#910000]">{score}</p>}
          {sub.feedback && <p className="mt-2 whitespace-pre-line text-sm text-gray-800">{sub.feedback}</p>}
        </div>
      )}

      {/* What they turned in */}
      {sub && (sub.text || fileHref) && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">Your submission · {formatShortDate(sub.submittedAt)}</p>
          {sub.text && <p className="mt-2 whitespace-pre-line text-sm text-gray-800">{sub.text}</p>}
          {fileHref && (
            <a href={fileHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#910000] hover:underline">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#2b2b2b] text-[9px] font-bold uppercase text-white" aria-hidden="true">
                {sub.fileName?.split(".").pop()?.slice(0, 4) ?? "file"}
              </span>
              <span className="truncate">{sub.fileName}</span>
            </a>
          )}
        </div>
      )}

      {formState.message && <div className="mt-4"><FormSuccess message={formState.message} /></div>}

      {sub && !showForm && (
        <div className="mt-4">
          <button type="button" onClick={() => setShowForm(true)} className={secondaryButtonClass}>Resubmit</button>
        </div>
      )}

      {showForm && (
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="assignmentId" value={assignment.id} />
          {assignment.allowsText && (
            <Field name={`${formId}-text`} label={sub ? "Updated answer" : "Your answer"} hideOptional error={errors?.text} hint={assignment.allowsFile ? "Write here, attach a file, or both." : undefined}>
              <textarea id={`${formId}-text`} name="text" rows={5} defaultValue={sub?.text ?? ""} className={inputClass} {...invalid(`${formId}-text`, errors?.text)} />
            </Field>
          )}
          {assignment.allowsFile && (
            <Field name={`${formId}-file`} label={sub?.fileName ? "Replace file" : "Attach a file"} hideOptional error={errors?.file} hint="PDF, Word, Excel, PowerPoint, PNG or JPG · up to 25 MB">
              <input id={`${formId}-file`} type="file" name="file" accept={ACCEPT} className={fileInputClass} {...invalid(`${formId}-file`, errors?.file)} />
            </Field>
          )}
          <FormError message={formState.error} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SubmitButton pendingText="Submitting…">{sub ? "Resubmit homework" : "Submit homework"}</SubmitButton>
            {sub && (
              <button type="button" onClick={() => setShowForm(false)} className="text-sm font-semibold text-gray-600 underline underline-offset-2 hover:text-gray-900">Cancel</button>
            )}
          </div>
        </form>
      )}
    </article>
  );
}

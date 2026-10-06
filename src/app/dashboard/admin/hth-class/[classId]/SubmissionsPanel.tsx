"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AssignmentSubmission, Cohort } from "@/db/schema";
import { getSubmissions, gradeSubmission, type SubmissionRow } from "@/app/dashboard/hth-class/assignment-actions";
import { FormState } from "@/types/form-state";
import { Field, FormError, FormSuccess, inputClass, checkboxClass, primaryButtonClass, ghostButtonClass } from "@/app/components/form";
import type { AdminAssignment } from "./AssignmentsPanel";

type CohortOption = Pick<Cohort, "id" | "name">;

const dateTime = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const STATUS_LABEL: Record<AssignmentSubmission["status"], string> = { submitted: "Needs grading", graded: "Graded", returned: "Returned for revision" };
const STATUS_CLASS: Record<AssignmentSubmission["status"], string> = {
  submitted: "bg-[#910000]/10 text-[#910000]",
  graded: "bg-green-100 text-green-800",
  returned: "bg-yellow-100 text-yellow-800",
};
const LONG_TEXT = 600;

function StatusChip({ status }: { status: AssignmentSubmission["status"] }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>;
}

function WrittenAnswer({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > LONG_TEXT;
  const shown = long && !open ? `${text.slice(0, LONG_TEXT).trimEnd()}…` : text;
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="whitespace-pre-wrap text-sm text-gray-800">{shown}</p>
      {long && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="mt-2 text-xs font-semibold text-[#910000] hover:underline">
          {open ? "Show less" : "Show full answer"}
        </button>
      )}
    </div>
  );
}

function SubmissionCard({ sub, onSaved }: { sub: SubmissionRow; onSaved: () => void }) {
  const [score, setScore] = useState(sub.score != null ? String(sub.score) : "");
  const [feedback, setFeedback] = useState(sub.feedback ?? "");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<FormState>({ message: "" });
  const points = sub.assignment.points;
  const fileHref = `/api/submissions/${sub.id}/file`;

  const save = (status: "graded" | "returned") => {
    if (score && !/^\d{1,4}$/.test(score)) {
      setResult({ message: "", error: "Score must be a whole number." });
      return;
    }
    if (points != null && score && Number(score) > points) {
      setResult({ message: "", error: `Score can't be more than ${points}.` });
      return;
    }
    start(async () => {
      const r = await gradeSubmission(sub.id, { score: score ? Number(score) : null, feedback: feedback.trim() || undefined, status });
      setResult(r);
      if (!r.error) onSaved();
    });
  };

  return (
    <li className="hth-card p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{sub.user.name}</p>
          <p className="text-sm text-gray-600">
            <a href={`mailto:${sub.user.email}`} className="text-[#910000] hover:underline">{sub.user.email}</a>
          </p>
          <p className="mt-1 text-sm text-gray-800">{sub.assignment.title}</p>
          <p className="text-xs text-gray-500">Submitted {dateTime.format(new Date(sub.submittedAt))}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusChip status={sub.status} />
          {sub.status !== "submitted" && sub.score != null && (
            <span className="text-sm font-semibold text-gray-800">{sub.score}{points != null ? ` / ${points}` : ""}</span>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {sub.text ? <WrittenAnswer text={sub.text} /> : <p className="text-sm text-gray-500">No written answer.</p>}
        {sub.fileName && (
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="min-w-0 truncate font-medium text-gray-800">{sub.fileName}</span>
            <a href={fileHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#910000] hover:underline">View</a>
            <a href={`${fileHref}?download=1`} className="font-semibold text-[#910000] hover:underline">Download</a>
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-[8rem_1fr]">
        <Field name={`score-${sub.id}`} label="Score" hideOptional>
          <div className="flex items-center gap-2">
            <input id={`score-${sub.id}`} type="text" inputMode="numeric" value={score} onChange={(e) => setScore(e.target.value)} placeholder={points != null ? "0" : "—"} className={`${inputClass} w-20`} />
            {points != null && <span className="text-sm text-gray-600">/ {points}</span>}
          </div>
        </Field>
        <Field name={`feedback-${sub.id}`} label="Feedback" hideOptional>
          <textarea id={`feedback-${sub.id}`} rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What went well, what to improve…" className={inputClass} />
        </Field>
        <div className="space-y-3 sm:col-span-2">
          <FormError message={result.error} />
          <FormSuccess message={result.message && !result.error ? result.message : undefined} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" disabled={pending} onClick={() => save("graded")} className={`${primaryButtonClass} py-2.5`}>{pending ? "Saving…" : "Save grade"}</button>
            <button type="button" disabled={pending} onClick={() => save("returned")} className={`${ghostButtonClass} py-2.5`}>Return for revision</button>
          </div>
        </div>
      </div>
    </li>
  );
}

interface Props {
  classId: number;
  cohorts: CohortOption[];
  assignments: AdminAssignment[];
}

/** Filterable list of submissions grouped by cohort, each with an inline grading form. */
export default function SubmissionsPanel({ classId, cohorts, assignments }: Props) {
  const router = useRouter();
  const [cohortId, setCohortId] = useState<number | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [onlyUngraded, setOnlyUngraded] = useState(false);
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loading, startLoad] = useTransition();
  const [reloadKey, setReloadKey] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    startLoad(async () => {
      try {
        const data = await getSubmissions(classId, { cohortId, assignmentId, onlyUngraded });
        if (id !== requestId.current) return; // a newer request superseded this one
        setRows(data);
        setLoadError("");
      } catch (err) {
        console.error(err);
        if (id === requestId.current) setLoadError("Couldn't load submissions.");
      }
    });
  }, [classId, cohortId, assignmentId, onlyUngraded, reloadKey]);

  // Group by cohort name; "No cohort" goes last.
  const groups = new Map<string, SubmissionRow[]>();
  for (const r of rows) {
    const key = r.cohort?.name ?? "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const ordered = Array.from(groups.entries()).sort(([a], [b]) => (a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)));

  const onSaved = () => {
    setReloadKey((k) => k + 1);
    router.refresh();
  };

  return (
    <section className="space-y-4">
      <div className="hth-card p-5 sm:p-6">
        <h3 className="text-2xl leading-tight text-gray-900">Submissions</h3>
        <p className="text-sm text-gray-600">Review what members handed in, give a score and feedback, or send it back for another pass. Members get an email either way.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field name="filter-cohort" label="Cohort" hideOptional>
            <select id="filter-cohort" value={cohortId ?? ""} onChange={(e) => setCohortId(e.target.value ? Number(e.target.value) : null)} className={inputClass}>
              <option value="">All cohorts</option>
              {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field name="filter-assignment" label="Assignment" hideOptional>
            <select id="filter-assignment" value={assignmentId ?? ""} onChange={(e) => setAssignmentId(e.target.value ? Number(e.target.value) : null)} className={inputClass}>
              <option value="">All assignments</option>
              {assignments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-3 text-sm text-gray-800 sm:self-end sm:pb-3">
            <input type="checkbox" checked={onlyUngraded} onChange={(e) => setOnlyUngraded(e.target.checked)} className={checkboxClass} />
            Ungraded only
          </label>
        </div>
      </div>

      {loadError && <FormError message={loadError} />}
      {loading && rows.length === 0 ? (
        <p className="text-sm text-gray-500">Loading submissions…</p>
      ) : rows.length === 0 ? (
        <p className="hth-card p-6 text-sm text-gray-500">{onlyUngraded ? "Nothing waiting to be graded." : "No submissions yet."}</p>
      ) : (
        <div className={`space-y-6 ${loading ? "opacity-60" : ""}`}>
          {ordered.map(([name, list]) => (
            <div key={name || "none"}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#910000]">{name || "No cohort"} · {list.length}</h4>
              <ul className="space-y-3">
                {list.map((s) => <SubmissionCard key={s.id} sub={s} onSaved={onSaved} />)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteLesson, reorderLessons, getEnrollCandidates, enrollMembers, setEnrollmentStatus,
  type AdminCourseDetail, type EnrollCandidate,
} from "@/app/dashboard/hth-class/course-actions";
import type { Lesson, Enrollment, Cohort } from "@/db/schema";
import { FormState } from "@/types/form-state";
import { Field, FormError, FormSuccess, inputClass, checkboxClass, primaryButtonClass, secondaryButtonClass, ghostButtonClass } from "@/app/components/form";
import CourseForm, { COURSE_TYPE_LABEL } from "../CourseForm";
import AttachmentsPanel from "./AttachmentsPanel";
import AssignmentsPanel, { formatDue, type AdminAssignment } from "./AssignmentsPanel";
import SubmissionsPanel from "./SubmissionsPanel";

export type Tab = "lessons" | "details" | "enrollment" | "submissions";
type CohortOption = Pick<Cohort, "id" | "name" | "startDate">;

const TAB_LABEL: Record<Tab, string> = { lessons: "Lessons", details: "Course details", enrollment: "Enrollment", submissions: "Homework" };
const ENROLLMENT_STATUS_LABEL: Record<Enrollment["status"], string> = {
  enrolled: "Enrolled",
  completed: "Completed",
  dropped: "Dropped",
  pending: "Pending",
  rejected: "Rejected",
};
const STATUS_CHOICES: Enrollment["status"][] = ["enrolled", "completed", "dropped"];
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function PublishedChip({ published }: { published: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
      {published ? "Published" : "Draft"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

function LessonsTab({ course }: { course: AdminCourseDetail }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const ids = course.lessons.map((l) => l.id);
  const files = (lessonId: number) => course.attachments.filter((a) => a.lessonId === lessonId).length;

  const move = (index: number, dir: -1 | 1) => {
    const next = [...ids];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    start(async () => {
      const r = await reorderLessons(course.id, next);
      setMsg(r.error || "");
      router.refresh();
    });
  };
  const remove = (lesson: Lesson) => {
    if (!confirm(`Delete "${lesson.title}"? Members' progress on it is removed too.`)) return;
    start(async () => {
      const r = await deleteLesson(lesson.id);
      setMsg(r.error || r.message);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">{course.lessons.length} lesson{course.lessons.length === 1 ? "" : "s"}. Open one to edit its content, video and downloads.</p>
        <Link href={`/dashboard/admin/hth-class/${course.id}/lessons/new`} className={secondaryButtonClass}>+ Add lesson</Link>
      </div>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
      {course.lessons.length === 0 ? (
        <p className="hth-card p-6 text-gray-600">No lessons yet.</p>
      ) : (
        <ol className="hth-card divide-y divide-gray-100 overflow-hidden">
          {course.lessons.map((l, i) => (
            <li key={l.id} className="flex items-center gap-4 px-5 py-4">
              <span className="font-display text-3xl leading-none text-[#910000] w-10 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <Link href={`/dashboard/admin/hth-class/${course.id}/lessons/${l.id}`} className="block truncate text-lg font-semibold text-gray-900 hover:text-[#910000]">{l.title}</Link>
                <p className="truncate text-sm text-gray-600">
                  {l.summary || <span className="text-gray-400">No summary yet</span>}
                </p>
                <p className="mt-1 flex flex-wrap gap-2 text-xs">
                  <PublishedChip published={l.isPublished} />
                  {l.videoUrl && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">Video</span>}
                  {l.durationMinutes ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">{l.durationMinutes} min</span> : null}
                  {files(l.id) > 0 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">{files(l.id)} file{files(l.id) === 1 ? "" : "s"}</span>}
                  {!l.content?.trim() && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Needs content</span>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" disabled={pending || i === 0} onClick={() => move(i, -1)} aria-label="Move up" className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30">↑</button>
                <button type="button" disabled={pending || i === course.lessons.length - 1} onClick={() => move(i, 1)} aria-label="Move down" className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30">↓</button>
                <Link href={`/dashboard/admin/hth-class/${course.id}/lessons/${l.id}`} className="rounded-lg border-2 border-[#910000] px-3 py-1.5 text-sm font-semibold text-[#910000] hover:bg-[#910000] hover:text-white">Open</Link>
                <button type="button" disabled={pending} onClick={() => remove(l)} className="rounded-lg px-2 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function EnrollmentRow({ e, totalLessons }: { e: AdminCourseDetail["enrollments"][number]; totalLessons: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const choices = STATUS_CHOICES.includes(e.status) ? STATUS_CHOICES : [e.status, ...STATUS_CHOICES];

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{e.user.name}</p>
        <p className="text-sm text-gray-600">
          <a href={`mailto:${e.user.email}`} className="text-[#910000] hover:underline">{e.user.email}</a>
          {e.cohort ? ` · ${e.cohort.name}` : " · No cohort"}
          {` · Enrolled ${shortDate.format(new Date(e.enrollmentDate))}`}
        </p>
        <p className="mt-1 text-xs text-gray-500">{e.completedCount} of {totalLessons} lesson{totalLessons === 1 ? "" : "s"} complete</p>
        {msg && <p className="mt-1 text-xs text-gray-600">{msg}</p>}
      </div>
      <select
        aria-label={`Enrollment status for ${e.user.name}`}
        disabled={pending}
        value={e.status}
        onChange={(ev) => {
          const status = ev.target.value as Enrollment["status"];
          startTransition(async () => {
            const r = await setEnrollmentStatus(e.id, status);
            setMsg(r.error || r.message);
            router.refresh();
          });
        }}
        className={`${inputClass} w-full py-1.5 text-sm sm:w-44`}
      >
        {choices.map((s) => <option key={s} value={s}>{ENROLLMENT_STATUS_LABEL[s]}</option>)}
      </select>
    </li>
  );
}

function EnrollPanel({ classId, cohorts }: { classId: number; cohorts: CohortOption[] }) {
  const router = useRouter();
  const [cohortId, setCohortId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<EnrollCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<FormState>({ message: "" });

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getEnrollCandidates(classId, cohortId ?? undefined)
      .then((rows) => { if (!ignore) { setCandidates(rows); setSelected(new Set()); } })
      .catch((err: unknown) => { console.error(err); if (!ignore) setResult({ message: "", error: "Couldn't load members." }); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [classId, cohortId]);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const waitlisted = candidates.filter((c) => c.onWaitlist);

  const enroll = () =>
    startTransition(async () => {
      const r = await enrollMembers(classId, Array.from(selected), cohortId);
      setResult(r);
      if (!r.error) {
        const ids = new Set(selected);
        setCandidates((prev) => prev.filter((c) => !ids.has(c.userId)));
        setSelected(new Set());
        router.refresh();
      }
    });

  return (
    <section className="hth-card p-5 sm:p-6">
      <h3 className="text-2xl leading-tight text-gray-900">Enroll members</h3>
      <p className="text-sm text-gray-600">Pick a cohort to see who is on its waitlist, then check the members to enroll. Each one gets an email.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field name="cohortId" label="Cohort" hideOptional hint="Optional. Sets which run of the course they belong to.">
          <select id="cohortId" value={cohortId ?? ""} onChange={(e) => setCohortId(e.target.value ? Number(e.target.value) : null)} className={inputClass}>
            <option value="">No cohort</option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.startDate ? ` (${shortDate.format(new Date(c.startDate))})` : ""}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-end">
          <button
            type="button"
            disabled={loading || waitlisted.length === 0}
            onClick={() => setSelected(new Set(waitlisted.map((c) => c.userId)))}
            className={`${ghostButtonClass} w-full py-2.5 text-sm disabled:opacity-40 sm:w-auto`}
          >
            Select all waitlisted ({waitlisted.length})
          </button>
        </div>
      </div>

      <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-gray-200">
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Loading members…</p>
        ) : candidates.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">Every approved member is already enrolled.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {candidates.map((c) => (
              <li key={c.userId}>
                <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-gray-50">
                  <input type="checkbox" checked={selected.has(c.userId)} onChange={() => toggle(c.userId)} className={`${checkboxClass} mt-1`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">{c.name}</span>
                      {c.onWaitlist && <span className="rounded-full bg-[#910000]/10 px-2 py-0.5 text-xs font-semibold text-[#910000]">Waitlist</span>}
                    </span>
                    <span className="block text-sm text-gray-600">
                      {c.email}{c.businessName ? ` · ${c.businessName}` : ""}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <FormError message={result.error} />
        <FormSuccess message={result.message} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button type="button" disabled={pending || selected.size === 0} onClick={enroll} className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}>
            {pending ? "Enrolling…" : `Enroll ${selected.size || ""} member${selected.size === 1 ? "" : "s"}`}
          </button>
          {selected.size > 0 && (
            <button type="button" onClick={() => setSelected(new Set())} className="text-sm font-semibold text-gray-600 hover:underline">
              Clear selection
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function EnrollmentTab({ course, cohorts }: { course: AdminCourseDetail; cohorts: CohortOption[] }) {
  const totalLessons = course.lessons.length;
  return (
    <div className="space-y-6">
      <section className="hth-card p-5 sm:p-6">
        <h3 className="text-2xl leading-tight text-gray-900">Enrolled members</h3>
        <p className="text-sm text-gray-600">{course.enrollmentCount} active · {course.enrollments.length} total</p>
        {course.enrollments.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Nobody is enrolled yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100">
            {course.enrollments.map((e) => <EnrollmentRow key={e.id} e={e} totalLessons={totalLessons} />)}
          </ul>
        )}
      </section>
      <EnrollPanel classId={course.id} cohorts={cohorts} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Homework
// ---------------------------------------------------------------------------

function HomeworkTab({ course, cohorts, assignments }: { course: AdminCourseDetail; cohorts: CohortOption[]; assignments: AdminAssignment[] }) {
  const ungraded = assignments.reduce((n, a) => n + (a.ungradedCount ?? 0), 0);
  return (
    <div className="space-y-6">
      <AssignmentsPanel classId={course.id} assignments={assignments.filter((a) => a.lessonId === null)} />

      <section className="hth-card overflow-hidden">
        <div className="px-5 pt-5 sm:px-6">
          <h3 className="text-2xl leading-tight text-gray-900">All assignments</h3>
          <p className="text-sm text-gray-600">
            {assignments.length} assignment{assignments.length === 1 ? "" : "s"} across the course{ungraded ? ` · ${ungraded} submission${ungraded === 1 ? "" : "s"} to grade` : ""}. Lesson homework is edited on the lesson page.
          </p>
        </div>
        {assignments.length === 0 ? (
          <p className="px-5 pb-5 pt-3 text-sm text-gray-500 sm:px-6">No assignments yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-2 sm:px-6">Assignment</th>
                  <th className="px-3 py-2">Lesson</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2 text-right">Submissions</th>
                  <th className="px-5 py-2 text-right sm:px-6">To grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-2 sm:px-6">
                      <span className="font-medium text-gray-900">{a.title}</span>
                      {!a.isPublished && <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">Draft</span>}
                    </td>
                    <td className="px-3 py-2 text-gray-700">
                      {a.lessonId ? (
                        <Link href={`/dashboard/admin/hth-class/${course.id}/lessons/${a.lessonId}`} className="hover:text-[#910000] hover:underline">{a.lessonTitle ?? "Lesson"}</Link>
                      ) : (
                        <span className="text-gray-500">Course</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">{formatDue(a.dueDate).replace(/^Due /, "")}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{a.submissionCount ?? 0}</td>
                    <td className="px-5 py-2 text-right sm:px-6">
                      {a.ungradedCount ? <span className="rounded-full bg-[#910000]/10 px-2 py-0.5 text-xs font-semibold text-[#910000]">{a.ungradedCount}</span> : <span className="text-gray-400">0</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <SubmissionsPanel classId={course.id} cohorts={cohorts} assignments={assignments} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface Props {
  course: AdminCourseDetail;
  cohorts: CohortOption[];
  assignments: AdminAssignment[];
  /** From `?tab=` on the page, e.g. the "Review submissions" email link. */
  initialTab?: Tab;
}

export default function CourseEditorClient({ course, cohorts, assignments, initialTab = "lessons" }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  useEffect(() => { setTab(initialTab); }, [initialTab]);

  return (
    <div className="w-full max-w-5xl">
      <header className="mb-6">
        <Link href="/dashboard/admin/hth-class" className="text-sm font-semibold text-[#910000] hover:underline">&larr; All courses</Link>
        <p className="mb-2 mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#910000]">HTH Curriculum</p>
        <h1 className="text-4xl leading-none text-gray-900 sm:text-5xl">{course.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#2b2b2b]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2b2b2b]">{COURSE_TYPE_LABEL[course.type]}</span>
          <PublishedChip published={course.isPublished} />
          <span className="text-sm text-gray-600">{course.lessons.length} lessons · {course.enrollmentCount} enrolled · Teacher: {course.teacher.name}</span>
        </div>
      </header>

      <nav aria-label="Course sections" className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-current={tab === t ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t ? "bg-[#910000] text-white" : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"}`}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </nav>

      {tab === "lessons" && <LessonsTab course={course} />}
      {tab === "details" && (
        <div className="space-y-6">
          <CourseForm course={course} />
          <AttachmentsPanel classId={course.id} attachments={course.attachments.filter((a) => a.lessonId === null)} />
        </div>
      )}
      {tab === "enrollment" && <EnrollmentTab course={course} cohorts={cohorts} />}
      {tab === "submissions" && <HomeworkTab course={course} cohorts={cohorts} assignments={assignments} />}
    </div>
  );
}

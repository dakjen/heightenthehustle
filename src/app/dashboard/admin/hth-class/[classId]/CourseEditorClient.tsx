"use client";

import { useActionState, useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  saveLesson, deleteLesson, reorderLessons, getEnrollCandidates, enrollMembers, setEnrollmentStatus,
  type AdminCourseDetail, type EnrollCandidate,
} from "@/app/dashboard/hth-class/course-actions";
import type { Lesson, Enrollment, Cohort } from "@/db/schema";
import { FormState } from "@/types/form-state";
import { Field, FormSection, SubmitButton, FormError, FormSuccess, inputClass, checkboxClass, primaryButtonClass, secondaryButtonClass, ghostButtonClass, invalidProps } from "@/app/components/form";
import Markdown from "@/app/components/Markdown";
import CourseForm, { COURSE_TYPE_LABEL } from "../CourseForm";

type Tab = "lessons" | "details" | "enrollment";
type CohortOption = Pick<Cohort, "id" | "name" | "startDate">;

const TAB_LABEL: Record<Tab, string> = { lessons: "Lessons", details: "Course details", enrollment: "Enrollment" };
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

function LessonEditor({ classId, lesson, onClose }: { classId: number; lesson: Lesson | null; onClose: () => void }) {
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(saveLesson, { message: "" });
  const errors = state.fieldErrors ?? {};
  const [draft, setDraft] = useState(lesson?.content ?? "");
  const [published, setPublished] = useState(lesson?.isPublished ?? true);
  const [showPreview, setShowPreview] = useState(false);
  const lastHandled = useRef<FormState | null>(null);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.message && !state.error) {
      router.refresh();
      onClose();
    }
  }, [state, router, onClose]);

  return (
    <form action={formAction} className="hth-pop space-y-5" noValidate>
      {lesson && <input type="hidden" name="id" value={lesson.id} />}
      <input type="hidden" name="classId" value={classId} />
      {/* saveLesson treats anything other than "off" as published, so send an explicit value. */}
      <input type="hidden" name="isPublished" value={published ? "on" : "off"} />
      <FormSection title={lesson ? `Edit lesson ${lesson.order}` : "New lesson"} description="Lessons appear to members in order. Unpublished lessons stay hidden.">
        <Field name="title" label="Title" required error={errors.title} className="sm:col-span-2">
          <input id="title" name="title" type="text" required defaultValue={lesson?.title ?? ""} className={inputClass} {...invalidProps("title", errors)} />
        </Field>
        <Field name="summary" label="Summary" error={errors.summary} className="sm:col-span-2" hint="One or two lines shown in the lesson list.">
          <input id="summary" name="summary" type="text" defaultValue={lesson?.summary ?? ""} className={inputClass} {...invalidProps("summary", errors)} />
        </Field>
        <Field name="videoUrl" label="Video link" error={errors.videoUrl} hint="YouTube, Vimeo, or Loom link, embedded at the top of the lesson.">
          <input id="videoUrl" name="videoUrl" type="url" inputMode="url" defaultValue={lesson?.videoUrl ?? ""} placeholder="https://" className={inputClass} {...invalidProps("videoUrl", errors)} />
        </Field>
        <Field name="durationMinutes" label="Duration (minutes)" error={errors.durationMinutes}>
          <input id="durationMinutes" name="durationMinutes" type="text" inputMode="numeric" pattern="\d{1,3}" defaultValue={lesson?.durationMinutes ?? ""} placeholder="45" className={inputClass} {...invalidProps("durationMinutes", errors)} />
        </Field>
        <label className="flex items-center gap-3 text-sm text-gray-800 sm:col-span-2">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className={checkboxClass} />
          Published (visible to enrolled members)
        </label>

        <div className="sm:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor="content" className="block text-sm font-medium text-gray-800">
              Content <span className="ml-1 text-xs font-normal text-gray-400">Markdown</span>
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
              id="content"
              name="content"
              rows={18}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={"## Welcome\n\nWrite the lesson here. Use **bold**, lists, and [links](https://)."}
              className={`${inputClass} min-h-[24rem] font-mono text-sm leading-relaxed`}
              {...invalidProps("content", errors)}
            />
            {showPreview && (
              <div className="min-h-[24rem] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                {draft.trim() ? <Markdown content={draft} /> : <p className="text-sm text-gray-400">Nothing to preview yet.</p>}
              </div>
            )}
          </div>
          {errors.content && <p className="mt-1 text-sm text-red-700">{errors.content}</p>}
        </div>

        <div className="space-y-3 sm:col-span-2">
          <FormError message={state.error} />
          <FormSuccess message={state.message} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <SubmitButton pendingText="Saving…">{lesson ? "Save lesson" : "Add lesson"}</SubmitButton>
            <button type="button" onClick={onClose} className={ghostButtonClass}>Cancel</button>
          </div>
        </div>
      </FormSection>
    </form>
  );
}

function LessonsTab({ course }: { course: AdminCourseDetail }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<{ open: false } | { open: true; lesson: Lesson | null }>({ open: false });
  const closeEditor = useCallback(() => setEditing({ open: false }), []);

  const run = (fn: () => Promise<FormState>) =>
    startTransition(async () => {
      const r = await fn();
      setMsg(r.error || r.message);
      router.refresh();
    });

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= course.lessons.length) return;
    const ids = course.lessons.map((l) => l.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => reorderLessons(course.id, ids));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          {course.lessons.length} lesson{course.lessons.length === 1 ? "" : "s"} · {course.lessons.filter((l) => l.isPublished).length} published
        </p>
        {!editing.open && (
          <button type="button" onClick={() => setEditing({ open: true, lesson: null })} className={`${secondaryButtonClass} py-2 text-sm`}>
            + Add lesson
          </button>
        )}
      </div>

      {editing.open && <LessonEditor key={editing.lesson?.id ?? "new"} classId={course.id} lesson={editing.lesson} onClose={closeEditor} />}

      {msg && <p className="text-sm text-gray-600">{msg}</p>}

      {course.lessons.length === 0 ? (
        !editing.open && <p className="hth-card p-6 text-gray-600">No lessons yet. Add the first one.</p>
      ) : (
        <ol className="space-y-3">
          {course.lessons.map((l, i) => (
            <li key={l.id} className="hth-card p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span className="font-display shrink-0 text-3xl leading-none text-[#910000]">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl leading-tight text-gray-900">{l.title}</h3>
                      <PublishedChip published={l.isPublished} />
                    </div>
                    {l.summary && <p className="mt-1 text-sm text-gray-600">{l.summary}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      {l.durationMinutes ? `${l.durationMinutes} min` : "No duration"}
                      {l.videoUrl ? " · Video" : ""}
                      {l.content ? " · Content" : " · No content yet"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  <button type="button" disabled={pending || i === 0} aria-label="Move up" onClick={() => move(i, -1)} className={`${ghostButtonClass} px-3 py-1.5 text-sm disabled:opacity-40`}>
                    Up
                  </button>
                  <button type="button" disabled={pending || i === course.lessons.length - 1} aria-label="Move down" onClick={() => move(i, 1)} className={`${ghostButtonClass} px-3 py-1.5 text-sm disabled:opacity-40`}>
                    Down
                  </button>
                  <button type="button" disabled={pending} onClick={() => setEditing({ open: true, lesson: l })} className={`${secondaryButtonClass} py-1.5 text-sm`}>
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => { if (confirm(`Delete "${l.title}"? Member progress on this lesson is removed too.`)) run(() => deleteLesson(l.id)); }}
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Enrollment
// ---------------------------------------------------------------------------

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
// Page
// ---------------------------------------------------------------------------

export default function CourseEditorClient({ course, cohorts }: { course: AdminCourseDetail; cohorts: CohortOption[] }) {
  const [tab, setTab] = useState<Tab>("lessons");

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
      {tab === "details" && <CourseForm course={course} />}
      {tab === "enrollment" && <EnrollmentTab course={course} cohorts={cohorts} />}
    </div>
  );
}

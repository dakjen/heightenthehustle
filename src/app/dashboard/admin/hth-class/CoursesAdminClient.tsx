"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setCoursePublished, deleteCourse, type AdminCourse } from "@/app/dashboard/hth-class/course-actions";
import { FormState } from "@/types/form-state";
import { secondaryButtonClass } from "@/app/components/form";
import CourseForm, { COURSE_TYPE_LABEL } from "./CourseForm";

function CourseCard({ course }: { course: AdminCourse }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  const run = (fn: () => Promise<FormState>) =>
    startTransition(async () => {
      const r = await fn();
      setMsg(r.error || r.message);
      router.refresh();
    });

  const publishedLessons = course.lessons.filter((l) => l.isPublished).length;

  return (
    <article className="hth-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#2b2b2b]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2b2b2b]">{COURSE_TYPE_LABEL[course.type]}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${course.isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
              {course.isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <h2 className="mt-2 text-3xl leading-none text-gray-900">{course.title}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {course.lessons.length} lesson{course.lessons.length === 1 ? "" : "s"}
            {publishedLessons !== course.lessons.length ? ` (${publishedLessons} published)` : ""}
            {" · "}{course.enrollmentCount} enrolled
            {" · "}Teacher: {course.teacher.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:shrink-0">
          <Link href={`/dashboard/admin/hth-class/${course.id}`} className={`${secondaryButtonClass} py-1.5 text-sm`}>
            Open
          </Link>
          <button type="button" disabled={pending} onClick={() => run(() => setCoursePublished(course.id, !course.isPublished))} className={`${secondaryButtonClass} py-1.5 text-sm disabled:opacity-60`}>
            {course.isPublished ? "Unpublish" : "Publish"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm(`Delete "${course.title}"? This removes its ${course.lessons.length} lesson(s), all enrollments, and member progress. This cannot be undone.`)) {
                run(() => deleteCourse(course.id));
              }
            }}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>
      {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}
    </article>
  );
}

export default function CoursesAdminClient({ courses }: { courses: AdminCourse[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(courses.length === 0);

  return (
    <div className="w-full max-w-5xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#910000]">HTH Curriculum</p>
          <h1 className="text-5xl leading-none text-gray-900">Courses</h1>
          <p className="mt-2 text-gray-600">Build courses and lessons, then enroll members from each course page.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/admin/hth-class/cohorts" className={`${secondaryButtonClass} py-2 text-sm`}>
            Cohorts &amp; Waitlist
          </Link>
          <button type="button" onClick={() => setShowCreate((v) => !v)} className={`${secondaryButtonClass} py-2 text-sm`}>
            {showCreate ? "Hide form" : "+ New course"}
          </button>
        </div>
      </header>

      {showCreate && (
        <div className="hth-pop mb-8">
          <CourseForm
            onSaved={(id) => router.push(`/dashboard/admin/hth-class/${id}`)}
            onCancel={courses.length > 0 ? () => setShowCreate(false) : undefined}
          />
        </div>
      )}

      <div className="space-y-5">
        {courses.length === 0 && !showCreate && <p className="text-gray-600">No courses yet. Create one to get started.</p>}
        {courses.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}

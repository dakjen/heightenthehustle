import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, hasPermission } from "@/lib/auth";
import Markdown from "@/app/components/Markdown";
import AttachmentList from "../AttachmentList";
import AssignmentCard from "../AssignmentCard";
import { getMyAssignments } from "../assignment-actions";
import { getMyCourses } from "../course-actions";
import { AssignmentStatusChip, ProgressBar, TypeChip, formatDuration, formatShortDate, percent } from "../course-ui";

export const dynamic = "force-dynamic";

function VideoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-current">
      <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h7A1.5 1.5 0 0 1 13 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 14.5v-9Zm11 2.2 2.4-1.6a.75.75 0 0 1 1.1.65v6.5a.75.75 0 0 1-1.1.65L14 12.3V7.7Z" />
    </svg>
  );
}

export default async function CoursePage({ params }: { params: Promise<{ classId: string }> }) {
  const user = await requireUser();
  const { classId: raw } = await params;
  const classId = Number(raw);
  if (!Number.isInteger(classId) || classId <= 0) notFound();

  const course = (await getMyCourses()).find((c) => c.id === classId);
  if (!course) notFound();

  const staff = hasPermission(user, "canManageClasses");
  const total = course.lessons.length;
  const pct = percent(course.completedCount, total);
  const nextLesson = course.lessons.find((l) => !l.completed) ?? null;
  const finished = total > 0 && course.completedCount === total;
  const cohortName = course.enrollment.cohort?.name ?? null;
  const homework = await getMyAssignments(classId, null);
  const homeworkDone = homework.filter((a) => a.submission !== null).length;
  const lessonHomework = homework.filter((a) => a.lessonId !== null);
  const courseHomework = homework.filter((a) => a.lessonId === null);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500 hth-fade-up">
        <Link href="/dashboard/hth-class" className="font-semibold text-[#910000] hover:underline">HTH Curriculum</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{course.title}</span>
      </nav>

      {staff && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 hth-fade-up">Preview as staff</p>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-[#2b2b2b] hth-stripes text-white p-6 sm:p-8 lg:p-12 hth-fade-up">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#910000] opacity-50 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <TypeChip type={course.type} dark />
            {cohortName && <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">{cohortName}</span>}
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl leading-none">{course.title}</h1>
          <div className="mt-6 flex items-end justify-between gap-4">
            <p className="text-sm text-gray-300">
              {total === 0
                ? "Lessons are on the way."
                : finished
                  ? "Every lesson complete. Nice work."
                  : `${course.completedCount} of ${total} lesson${total === 1 ? "" : "s"} done`}
            </p>
            <p className="font-display text-3xl leading-none text-[#ff5c5c]">{pct}%</p>
          </div>
          <ProgressBar value={pct} dark className="mt-2" />
          {homework.length > 0 && (
            <p className="mt-2 text-sm text-gray-300">
              <a href="#homework" className="hover:underline">
                Homework: <span className="font-semibold text-white">{homeworkDone} of {homework.length}</span> submitted
              </a>
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {nextLesson && (
              <Link
                href={`/dashboard/hth-class/${course.id}/${nextLesson.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-[#910000] px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-[#7a0000] hover:shadow-lg"
              >
                {course.completedCount > 0 ? "Continue" : "Start"}: Unit {nextLesson.order}
              </Link>
            )}
            {course.syllabusUrl && (
              <a
                href={course.syllabusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:bg-white/20"
              >
                View syllabus
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      {course.description && (
        <section className="mt-6 hth-card p-6 lg:p-8 hth-fade-up hth-fade-up-delay-1">
          <h2 className="text-3xl text-gray-900 mb-4">About this course</h2>
          <Markdown content={course.description} />
        </section>
      )}

      <AttachmentList attachments={course.attachments} title="Course templates & downloads" />

      {/* Lessons */}
      <section className="mt-6 hth-card p-6 lg:p-8 hth-fade-up hth-fade-up-delay-2">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl text-gray-900">Lessons</h2>
          <p className="text-sm text-gray-500">{total} unit{total === 1 ? "" : "s"}</p>
        </div>
        {total === 0 ? (
          <p className="mt-4 text-gray-600">No lessons have been published yet. Check back soon.</p>
        ) : (
          <ol className="mt-4 divide-y divide-gray-100">
            {course.lessons.map((l, i) => {
              const isNext = nextLesson?.id === l.id;
              const duration = formatDuration(l.durationMinutes);
              return (
                <li key={l.id}>
                  <Link
                    href={`/dashboard/hth-class/${course.id}/${l.id}`}
                    className={`-mx-3 flex items-start gap-4 rounded-xl px-3 py-4 transition hover:bg-gray-50 ${isNext ? "bg-[#910000]/5 ring-1 ring-[#910000]/20" : ""}`}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        l.completed ? "bg-green-600 text-white" : isNext ? "bg-[#910000] text-white" : "bg-gray-100 text-gray-500"
                      }`}
                      aria-label={l.completed ? "Completed" : `Unit ${i + 1}`}
                    >
                      {l.completed ? "✓" : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className={`font-semibold ${l.completed ? "text-gray-500" : "text-gray-900"}`}>
                          <span className="text-gray-400">Unit {l.order} · </span>{l.title}
                        </p>
                        {isNext && <span className="rounded-full bg-[#910000] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">Up next</span>}
                      </div>
                      {l.summary && <p className="mt-0.5 text-sm text-gray-600">{l.summary}</p>}
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {l.videoUrl && (
                          <span className="inline-flex items-center gap-1 text-[#910000]"><VideoIcon /> Video</span>
                        )}
                        {duration && <span>{duration}</span>}
                      </div>
                    </div>
                    <span aria-hidden="true" className="mt-1 hidden text-gray-300 sm:block">→</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Homework */}
      {homework.length > 0 && (
        <section id="homework" className="mt-6 hth-card p-6 lg:p-8 hth-fade-up hth-fade-up-delay-3 scroll-mt-6" aria-labelledby="homework-heading">
          <div className="flex items-end justify-between gap-4">
            <h2 id="homework-heading" className="text-3xl text-gray-900">Homework</h2>
            <p className="text-sm text-gray-500">{homeworkDone} of {homework.length} submitted</p>
          </div>
          {lessonHomework.length > 0 && (
          <ul className="mt-4 divide-y divide-gray-100">
            {lessonHomework.map((a) => {
              const lessonNum = course.lessons.find((l) => l.id === a.lessonId)?.order ?? null;
              const meta = [
                a.lessonTitle ? `${lessonNum !== null ? `Unit ${lessonNum} · ` : ""}${a.lessonTitle}` : null,
                a.dueDate ? `Due ${formatShortDate(a.dueDate)}` : null,
                a.points != null ? `${a.points} pt${a.points === 1 ? "" : "s"}` : null,
              ].filter((m): m is string => m !== null);
              return (
                <li key={a.id}>
                  <Link
                    href={`/dashboard/hth-class/${course.id}/${a.lessonId}`}
                    className="-mx-3 flex flex-col gap-2 rounded-xl px-3 py-3.5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{a.title}</p>
                      {meta.length > 0 && <p className="mt-0.5 text-xs text-gray-500">{meta.join(" · ")}</p>}
                    </div>
                    <AssignmentStatusChip assignment={a} className="self-start sm:self-center" />
                    <span aria-hidden="true" className="hidden text-gray-300 sm:block">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          )}
          {courseHomework.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Course-wide assignments</h3>
              {courseHomework.map((a) => (
                <AssignmentCard key={a.id} assignment={a} courseId={course.id} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

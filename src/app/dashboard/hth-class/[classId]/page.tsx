import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, hasPermission } from "@/lib/auth";
import Markdown from "@/app/components/Markdown";
import AssignmentCard from "../AssignmentCard";
import { getMyAssignments } from "../assignment-actions";
import { getMyCourses } from "../course-actions";
import { AssignmentStatusChip, ProgressBar, TypeChip, formatDuration, formatShortDate, percent } from "../course-ui";

export const dynamic = "force-dynamic";

function SectionBar({ title, right, highlight }: { title: string; right?: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between border-y border-gray-200 px-5 py-2 ${highlight ? "bg-[#910000] text-white" : "bg-gray-100 text-gray-800"}`}>
      <span className="text-xs font-bold uppercase tracking-[0.18em]">{title}</span>
      {right && <span className={`text-xs font-semibold ${highlight ? "text-white/90" : "text-gray-500"}`}>{right}</span>}
    </div>
  );
}
function DocIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-current text-gray-500"><path d="M5 2.5A1.5 1.5 0 0 1 6.5 1h5.1c.4 0 .8.16 1.06.44l2.9 2.9c.28.27.44.66.44 1.06v11.1A1.5 1.5 0 0 1 14.5 18h-8A1.5 1.5 0 0 1 5 16.5v-14ZM7 8.75c0-.41.34-.75.75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 7 8.75Zm0 3c0-.41.34-.75.75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" /></svg>;
}
function PencilIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-current text-gray-500"><path d="M13.6 2.4a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L7.3 16.7a1 1 0 0 1-.45.26l-4 1a.75.75 0 0 1-.9-.9l1-4a1 1 0 0 1 .26-.45L13.6 2.4Z" /></svg>;
}
function LinkIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-current text-gray-500"><path d="M12.6 3.3a3.5 3.5 0 0 1 4.95 4.95l-2.2 2.2a.75.75 0 1 1-1.06-1.06l2.2-2.2a2 2 0 1 0-2.83-2.83l-2.2 2.2A.75.75 0 1 1 10.4 5.5l2.2-2.2Zm-5.2 5.2a.75.75 0 0 1 1.06 1.06l-2.2 2.2a2 2 0 1 0 2.83 2.83l2.2-2.2a.75.75 0 1 1 1.06 1.06l-2.2 2.2A3.5 3.5 0 0 1 5.2 10.7l2.2-2.2Zm.9 3.8a.75.75 0 0 1 0-1.06l4.2-4.2a.75.75 0 1 1 1.06 1.06l-4.2 4.2a.75.75 0 0 1-1.06 0Z" /></svg>;
}
function CheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-current text-green-600"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a.75.75 0 0 0-1.06-1.06L9 11.3 7.36 9.64a.75.75 0 0 0-1.06 1.06l2.2 2.2a.75.75 0 0 0 1.06 0l4.14-4.2Z" clipRule="evenodd" /></svg>;
}
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

      {/* Outline: Course Objectives block, then one section per unit with its lesson + assignments */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white hth-fade-up hth-fade-up-delay-1">
        <SectionBar title="Course objectives" />
        <ul className="divide-y divide-gray-100">
          {course.description && (
            <li>
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-3 px-5 py-3 text-gray-900 hover:bg-gray-50">
                  <DocIcon /><span className="font-semibold">Learning outcomes &amp; course description</span>
                  <span className="ml-auto text-xs text-gray-400 group-open:hidden">Show</span>
                  <span className="ml-auto hidden text-xs text-gray-400 group-open:inline">Hide</span>
                </summary>
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4"><Markdown content={course.description} /></div>
              </details>
            </li>
          )}
          {course.syllabusUrl && (
            <li>
              <a href={course.syllabusUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3 font-semibold text-gray-900 hover:bg-gray-50 hover:text-[#910000]">
                <LinkIcon />Syllabus<span className="ml-auto text-xs font-normal text-gray-400">Opens in a new tab ↗</span>
              </a>
            </li>
          )}
          {homework.length > 0 && (
            <li>
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-3 px-5 py-3 text-gray-900 hover:bg-gray-50">
                  <PencilIcon /><span className="font-semibold">Assignment list &amp; description</span>
                  <span className="ml-auto text-xs text-gray-400">{homeworkDone} of {homework.length} submitted</span>
                </summary>
                <ol className="divide-y divide-gray-100 border-t border-gray-100 bg-gray-50">
                  {homework.map((a) => {
                    const unitIndex = course.lessons.findIndex((l) => l.id === a.lessonId);
                    return (
                      <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5 text-sm">
                        <span className="font-medium text-gray-900">{a.title}</span>
                        <span className="text-gray-500">{unitIndex >= 0 ? `Unit ${unitIndex + 1}` : "Course-wide"}{a.dueDate ? ` · due ${formatShortDate(a.dueDate)}` : ""}{a.points ? ` · ${a.points} pts` : ""}</span>
                        <span className="ml-auto"><AssignmentStatusChip assignment={a} /></span>
                      </li>
                    );
                  })}
                </ol>
              </details>
            </li>
          )}
          {course.attachments.length > 0 && (
            <li>
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-3 px-5 py-3 text-gray-900 hover:bg-gray-50">
                  <DocIcon /><span className="font-semibold">Templates &amp; downloads</span>
                  <span className="ml-auto text-xs text-gray-400">{course.attachments.length} file{course.attachments.length === 1 ? "" : "s"}</span>
                </summary>
                <ul className="divide-y divide-gray-100 border-t border-gray-100 bg-gray-50">
                  {course.attachments.map((f) => (
                    <li key={f.id}>
                      <a href={f.url} target="_blank" rel="noopener noreferrer" download={f.fileName} className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-900 hover:text-[#910000]">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#2b2b2b] text-[9px] font-bold uppercase text-white">{f.fileName.split(".").pop()?.slice(0, 4)}</span>
                        {f.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          )}
          {courseHomework.map((a) => (
            <li key={a.id} className="px-5 py-4"><AssignmentCard assignment={a} courseId={course.id} /></li>
          ))}
        </ul>

        {course.lessons.length === 0 && (
          <p className="px-5 py-6 text-gray-600">Lessons are on the way.</p>
        )}

        {course.lessons.map((l, i) => {
          const href = `/dashboard/hth-class/${course.id}/${l.id}`;
          const isNext = nextLesson?.id === l.id;
          const unitHomework = lessonHomework.filter((a) => a.lessonId === l.id);
          return (
            <div key={l.id} id={`unit-${i + 1}`} className="scroll-mt-6">
              <SectionBar title={`Unit ${i + 1}`} right={l.completed ? "Completed" : isNext ? "Up next" : undefined} highlight={isNext} />
              <ul className="divide-y divide-gray-100">
                <li>
                  <Link href={href} className={`flex items-start gap-3 px-5 py-3 hover:bg-gray-50 ${isNext ? "bg-[#910000]/[0.04]" : ""}`}>
                    <span className="mt-0.5">{l.completed ? <CheckIcon /> : <DocIcon />}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block font-semibold ${l.completed ? "text-gray-500" : "text-gray-900"}`}>{l.title}</span>
                      {l.summary && <span className="block text-sm text-gray-600">{l.summary}</span>}
                      <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        {l.videoUrl && <span className="inline-flex items-center gap-1"><VideoIcon /> Video</span>}
                        {l.durationMinutes ? <span>{formatDuration(l.durationMinutes)}</span> : null}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-[#910000]">{l.completed ? "Review" : isNext ? "Start →" : "Open →"}</span>
                  </Link>
                </li>
                {unitHomework.map((a) => (
                  <li key={a.id}>
                    <Link href={`${href}#homework`} className="flex items-center gap-3 px-5 py-2.5 pl-12 hover:bg-gray-50">
                      <PencilIcon />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-gray-900">{a.title}</span>
                        {(a.dueDate || a.points) && (
                          <span className="block text-xs text-gray-500">{a.dueDate ? `Due ${formatShortDate(a.dueDate)}` : ""}{a.dueDate && a.points ? " · " : ""}{a.points ? `${a.points} pts` : ""}</span>
                        )}
                      </span>
                      <AssignmentStatusChip assignment={a} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {finished && (
        <p className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">You&apos;ve completed every lesson in this course. Nice work.</p>
      )}
    </div>
  );
}

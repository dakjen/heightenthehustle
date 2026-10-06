import { toEmbedUrl, extractVideos } from "@/lib/video";
import LessonVideos from "../../LessonVideos";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import Markdown from "@/app/components/Markdown";
import AttachmentList from "../../AttachmentList";
import AssignmentCard from "../../AssignmentCard";
import { getMyAssignments } from "../../assignment-actions";
import { getLessonForMember } from "../../course-actions";
import { ProgressBar, formatDuration, percent } from "../../course-ui";
import LessonClient from "./LessonClient";

export const dynamic = "force-dynamic";

/** Turn a YouTube / Vimeo / Loom share link into an embeddable URL, or null if we don't recognise it. */
export default async function LessonPage({ params }: { params: Promise<{ classId: string; lessonId: string }> }) {
  await requireUser();
  const { classId: rawClass, lessonId: rawLesson } = await params;
  const classId = Number(rawClass);
  const lessonId = Number(rawLesson);
  if (!Number.isInteger(classId) || classId <= 0 || !Number.isInteger(lessonId) || lessonId <= 0) notFound();

  const view = await getLessonForMember(classId, lessonId);
  if (!view) notFound();
  const homework = await getMyAssignments(classId, lessonId);

  const { lesson, course, prev, next, completed, index, total, attachments } = view;
  const pct = percent(index + 1, total);
  const embed = lesson.videoUrl ? toEmbedUrl(lesson.videoUrl) : null;
  // Featured video first (if set on the lesson), then every video linked in the content.
  const videos = [
    ...(lesson.videoUrl && embed ? [{ title: lesson.title, url: lesson.videoUrl, embed }] : []),
    ...extractVideos(lesson.content).filter((v) => v.embed !== embed),
  ];
  const duration = formatDuration(lesson.durationMinutes);
  const courseHref = `/dashboard/hth-class/${course.id}`;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500 hth-fade-up">
        <Link href="/dashboard/hth-class" className="font-semibold text-[#910000] hover:underline">HTH Curriculum</Link>
        <span className="mx-2">/</span>
        <Link href={courseHref} className="font-semibold text-[#910000] hover:underline">{course.title}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Unit {lesson.order}</span>
      </nav>

      {!lesson.isPublished && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 hth-fade-up">Staff preview: this lesson is not published yet.</p>
      )}

      <header className="hth-fade-up">
        <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          <span>Lesson {index + 1} of {total}</span>
          {completed && <span className="text-green-700">Completed</span>}
        </div>
        <ProgressBar value={pct} className="mt-2" />
        <h1 className="mt-5 text-4xl sm:text-5xl leading-none text-gray-900">{lesson.title}</h1>
        {(lesson.summary || duration) && (
          <p className="mt-2 text-gray-600">
            {lesson.summary}
            {lesson.summary && duration ? " · " : ""}
            {duration}
          </p>
        )}
      </header>

      <LessonVideos videos={videos} lessonTitle={lesson.title} />
      {lesson.videoUrl && !embed && (
        <p className="mt-4">
          <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg border-2 border-[#910000] bg-white px-5 py-2.5 font-semibold text-[#910000] transition hover:bg-[#910000] hover:text-white">
            Watch the video
          </a>
        </p>
      )}

      <article className="mt-6 hth-card p-6 sm:p-8 lg:p-10 hth-fade-up hth-fade-up-delay-1">
        {lesson.content ? (
          <Markdown content={lesson.content} embedVideos={false} />
        ) : (
          <p className="text-gray-600">This lesson doesn&apos;t have written content yet.</p>
        )}
      </article>

      <AttachmentList attachments={attachments} title="Downloads & templates for this lesson" />

      {homework.length > 0 && (
        <section className="mt-6 hth-fade-up hth-fade-up-delay-2" aria-labelledby="lesson-homework">
          <div className="flex items-end justify-between gap-4 px-1">
            <h2 id="lesson-homework" className="text-3xl text-gray-900">Homework for this lesson</h2>
            <p className="text-sm text-gray-500">{homework.length} assignment{homework.length === 1 ? "" : "s"}</p>
          </div>
          <div className="mt-3 space-y-4">
            {homework.map((a) => (
              <AssignmentCard key={a.id} assignment={a} courseId={course.id} />
            ))}
          </div>
        </section>
      )}

      <LessonClient
        lessonId={lesson.id}
        completed={completed}
        courseHref={courseHref}
        prev={prev ? { href: `${courseHref}/${prev.id}`, title: prev.title } : null}
        next={next ? { href: `${courseHref}/${next.id}`, title: next.title } : null}
      />
    </div>
  );
}

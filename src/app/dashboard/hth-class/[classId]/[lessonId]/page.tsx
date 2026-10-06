import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import Markdown from "@/app/components/Markdown";
import { getLessonForMember } from "../../course-actions";
import { ProgressBar, formatDuration, percent } from "../../course-ui";
import LessonClient from "./LessonClient";

export const dynamic = "force-dynamic";

/** Turn a YouTube / Vimeo / Loom share link into an embeddable URL, or null if we don't recognise it. */
function toEmbedUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const seg = url.pathname.split("/").filter(Boolean);
  const safeId = (s: string | undefined) => (s && /^[\w-]+$/.test(s) ? s : null);

  if (host === "youtu.be") {
    const id = safeId(seg[0]);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (seg[0] === "watch") {
      const id = safeId(url.searchParams.get("v") ?? undefined);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if ((seg[0] === "embed" || seg[0] === "shorts" || seg[0] === "live") && safeId(seg[1])) return `https://www.youtube.com/embed/${seg[1]}`;
    return null;
  }
  if (host === "vimeo.com") {
    const id = seg.find((s) => /^\d+$/.test(s));
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (host === "player.vimeo.com") {
    return seg[0] === "video" && /^\d+$/.test(seg[1] ?? "") ? `https://player.vimeo.com/video/${seg[1]}` : null;
  }
  if (host === "loom.com") {
    if ((seg[0] === "share" || seg[0] === "embed") && safeId(seg[1])) return `https://www.loom.com/embed/${seg[1]}`;
    return null;
  }
  return null;
}

export default async function LessonPage({ params }: { params: Promise<{ classId: string; lessonId: string }> }) {
  await requireUser();
  const { classId: rawClass, lessonId: rawLesson } = await params;
  const classId = Number(rawClass);
  const lessonId = Number(rawLesson);
  if (!Number.isInteger(classId) || classId <= 0 || !Number.isInteger(lessonId) || lessonId <= 0) notFound();

  const view = await getLessonForMember(classId, lessonId);
  if (!view) notFound();

  const { lesson, course, prev, next, completed, index, total } = view;
  const pct = percent(index + 1, total);
  const embed = lesson.videoUrl ? toEmbedUrl(lesson.videoUrl) : null;
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

      {lesson.videoUrl && (
        <section className="mt-6 hth-fade-up hth-fade-up-delay-1">
          {embed ? (
            <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-md" style={{ aspectRatio: "16 / 9" }}>
              <iframe
                src={embed}
                title={lesson.title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border-2 border-[#910000] bg-white px-5 py-2.5 font-semibold text-[#910000] transition hover:bg-[#910000] hover:text-white"
            >
              Watch the video
            </a>
          )}
        </section>
      )}

      <article className="mt-6 hth-card p-6 sm:p-8 lg:p-10 hth-fade-up hth-fade-up-delay-1">
        {lesson.content ? (
          <Markdown content={lesson.content} />
        ) : (
          <p className="text-gray-600">This lesson doesn&apos;t have written content yet.</p>
        )}
      </article>

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

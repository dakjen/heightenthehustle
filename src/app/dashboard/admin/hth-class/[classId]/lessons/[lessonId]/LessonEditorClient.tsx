"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lesson, CourseAttachment } from "@/db/schema";
import { saveLesson, deleteLesson } from "@/app/dashboard/hth-class/course-actions";
import { FormState } from "@/types/form-state";
import { Field, FormSection, SubmitButton, FormError, FormSuccess, inputClass, checkboxClass, secondaryButtonClass, ghostButtonClass, invalidProps } from "@/app/components/form";
import Markdown from "@/app/components/Markdown";
import { toEmbedUrl } from "@/lib/video";
import AttachmentsPanel from "../../AttachmentsPanel";
import AssignmentsPanel, { type AdminAssignment } from "../../AssignmentsPanel";

interface Props {
  classId: number;
  courseTitle: string;
  lesson: Lesson | null; // null = creating
  lessonNumber: number;
  attachments: CourseAttachment[];
  assignments: AdminAssignment[];
}

export default function LessonEditorClient({ classId, courseTitle, lesson, lessonNumber, attachments, assignments }: Props) {
  const router = useRouter();
  const backHref = `/dashboard/admin/hth-class/${classId}`;
  const [state, formAction] = useActionState<FormState, FormData>(saveLesson, { message: "" });
  const errors = state.fieldErrors ?? {};
  const [draft, setDraft] = useState(lesson?.content ?? "");
  const [published, setPublished] = useState(lesson?.isPublished ?? true);
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");
  const [showPreview, setShowPreview] = useState(Boolean(lesson?.content));
  const [pending, start] = useTransition();
  const lastHandled = useRef<FormState | null>(null);
  const embed = videoUrl ? toEmbedUrl(videoUrl) : null;

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.message && !state.error) {
      if (!lesson && state.businessId) {
        router.push(`${backHref}/lessons/${state.businessId}`); // new lesson: open its page
      } else {
        router.refresh();
      }
    }
  }, [state, router, lesson, backHref]);

  const remove = () => {
    if (!lesson || !confirm(`Delete "${lesson.title}"? Members' progress on it is removed too.`)) return;
    start(async () => {
      const r = await deleteLesson(lesson.id);
      if (!r.error) router.push(backHref);
    });
  };

  return (
    <div className="w-full max-w-5xl">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/dashboard/admin/hth-class" className="hover:text-[#910000]">Courses</Link>
        <span className="mx-2">›</span>
        <Link href={backHref} className="hover:text-[#910000]">{courseTitle}</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{lesson ? `Unit ${lessonNumber}` : "New lesson"}</span>
      </nav>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">{lesson ? `Lesson ${lessonNumber}` : "Add a lesson"}</p>
          <h1 className="text-5xl text-gray-900 leading-none">{lesson?.title ?? "New lesson"}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {lesson && (
            <Link href={`/dashboard/hth-class/${classId}/${lesson.id}`} target="_blank" className={secondaryButtonClass}>Preview as member</Link>
          )}
          {lesson && (
            <button type="button" disabled={pending} onClick={remove} className="rounded-lg px-4 py-2.5 font-semibold text-red-700 hover:bg-red-50">Delete lesson</button>
          )}
        </div>
      </header>

      {embed && (
        <section className="mb-6 hth-card overflow-hidden">
          <div className="relative aspect-video w-full bg-[#2b2b2b]">
            <iframe src={embed} title="Featured video" className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          </div>
          <p className="px-5 py-2 text-xs text-gray-500">Featured video, shown above the lesson content. Videos linked inside the content also embed with their captions (use Preview to check).</p>
        </section>
      )}

      <form action={formAction} className="space-y-5" noValidate>
        {lesson && <input type="hidden" name="id" value={lesson.id} />}
        <input type="hidden" name="classId" value={classId} />
        {/* saveLesson treats anything other than "off" as published, so send an explicit value. */}
        <input type="hidden" name="isPublished" value={published ? "on" : "off"} />
      <FormSection title={lesson ? "Lesson details" : "New lesson"} description="Lessons appear to members in order. Unpublished lessons stay hidden.">
        <Field name="title" label="Title" required error={errors.title} className="sm:col-span-2">
          <input id="title" name="title" type="text" required defaultValue={lesson?.title ?? ""} className={inputClass} {...invalidProps("title", errors)} />
        </Field>
        <Field name="summary" label="Summary" error={errors.summary} className="sm:col-span-2" hint="One or two lines shown in the lesson list.">
          <input id="summary" name="summary" type="text" defaultValue={lesson?.summary ?? ""} className={inputClass} {...invalidProps("summary", errors)} />
        </Field>
        <Field name="videoUrl" label="Video link" error={errors.videoUrl} hint="YouTube, Vimeo, or Loom link, embedded at the top of the lesson.">
          <input id="videoUrl" name="videoUrl" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" className={inputClass} {...invalidProps("videoUrl", errors)} />
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
            <SubmitButton pendingText="Saving…">{lesson ? "Save lesson" : "Create lesson"}</SubmitButton>
            <Link href={backHref} className={ghostButtonClass}>Back to course</Link>
          </div>
        </div>
      </FormSection>
      </form>

      {lesson ? (
        <div className="mt-6 space-y-6">
          <AttachmentsPanel classId={classId} lessonId={lesson.id} attachments={attachments} />
          <AssignmentsPanel classId={classId} lessonId={lesson.id} assignments={assignments} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-500">Create the lesson first, then you can add downloads, templates and homework to it.</p>
      )}
    </div>
  );
}

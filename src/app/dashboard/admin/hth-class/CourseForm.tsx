"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveCourse, type AdminCourse } from "@/app/dashboard/hth-class/course-actions";
import { FormState } from "@/types/form-state";
import { Field, FormSection, SubmitButton, FormError, FormSuccess, inputClass, checkboxClass, ghostButtonClass, invalidProps } from "@/app/components/form";

export const COURSE_TYPE_LABEL: Record<AdminCourse["type"], string> = {
  "pre-course": "Pre-course",
  "hth-course": "HTH course",
};

type CourseFormProps = {
  /** Existing course to edit. Omit to create a new one. */
  course?: Pick<AdminCourse, "id" | "title" | "description" | "type" | "syllabusUrl" | "isPublished">;
  /** Called after a successful save with the saved course id. */
  onSaved?: (courseId: number) => void;
  onCancel?: () => void;
};

/** Create/edit form for a course. Shared by the course list and the course editor's "Course details" tab. */
export default function CourseForm({ course, onSaved, onCancel }: CourseFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(saveCourse, { message: "" });
  const errors = state.fieldErrors ?? {};
  const lastHandled = useRef<FormState | null>(null);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.message && !state.error) {
      router.refresh();
      if (state.businessId) onSaved?.(state.businessId);
    }
  }, [state, router, onSaved]);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {course && <input type="hidden" name="id" value={course.id} />}
      <FormSection
        title={course ? "Course details" : "New course"}
        description="Members only see published courses they are enrolled in."
      >
        <Field name="title" label="Title" required error={errors.title} className="sm:col-span-2">
          <input id="title" name="title" type="text" required defaultValue={course?.title ?? ""} placeholder="Heighten the Hustle: Core Curriculum" className={inputClass} {...invalidProps("title", errors)} />
        </Field>
        <Field name="type" label="Type" required error={errors.type}>
          <select id="type" name="type" required defaultValue={course?.type ?? "hth-course"} className={inputClass} {...invalidProps("type", errors)}>
            {(Object.keys(COURSE_TYPE_LABEL) as AdminCourse["type"][]).map((t) => (
              <option key={t} value={t}>{COURSE_TYPE_LABEL[t]}</option>
            ))}
          </select>
        </Field>
        <Field name="syllabusUrl" label="Syllabus link" error={errors.syllabusUrl} hint="A Google Drive, Dropbox, or PDF link members can open.">
          <input id="syllabusUrl" name="syllabusUrl" type="url" inputMode="url" defaultValue={course?.syllabusUrl ?? ""} placeholder="https://" className={inputClass} {...invalidProps("syllabusUrl", errors)} />
        </Field>
        <Field name="description" label="Description" error={errors.description} className="sm:col-span-2" hint="Markdown is supported: headings, lists, bold, links.">
          <textarea id="description" name="description" rows={6} defaultValue={course?.description ?? ""} className={`${inputClass} font-mono text-sm`} />
        </Field>
        <label className="flex items-center gap-3 text-sm text-gray-800 sm:col-span-2">
          <input type="checkbox" name="isPublished" defaultChecked={course?.isPublished ?? false} className={checkboxClass} />
          Published (visible to enrolled members)
        </label>
        <div className="space-y-3 sm:col-span-2">
          <FormError message={state.error} />
          <FormSuccess message={state.message} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <SubmitButton pendingText="Saving…">{course ? "Save course" : "Create course"}</SubmitButton>
            {onCancel && (
              <button type="button" onClick={onCancel} className={ghostButtonClass}>Cancel</button>
            )}
          </div>
        </div>
      </FormSection>
    </form>
  );
}

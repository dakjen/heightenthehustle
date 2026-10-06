import { notFound } from "next/navigation";
import { getAdminCourse } from "@/app/dashboard/hth-class/course-actions";
import LessonEditorClient from "./LessonEditorClient";

export const dynamic = "force-dynamic";

/** /admin/hth-class/[classId]/lessons/new creates; /lessons/[id] edits. Guarded by the admin/hth-class layout. */
export default async function AdminLessonPage({ params }: { params: Promise<{ classId: string; lessonId: string }> }) {
  const { classId: rawClass, lessonId: rawLesson } = await params;
  const classId = Number(rawClass);
  if (!Number.isInteger(classId)) notFound();

  const course = await getAdminCourse(classId);
  if (!course) notFound();

  if (rawLesson === "new") {
    return <LessonEditorClient classId={classId} courseTitle={course.title} lesson={null} lessonNumber={course.lessons.length + 1} attachments={[]} />;
  }

  const lessonId = Number(rawLesson);
  const index = course.lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();

  return (
    <LessonEditorClient
      classId={classId}
      courseTitle={course.title}
      lesson={course.lessons[index]}
      lessonNumber={index + 1}
      attachments={course.attachments.filter((a) => a.lessonId === lessonId)}
    />
  );
}

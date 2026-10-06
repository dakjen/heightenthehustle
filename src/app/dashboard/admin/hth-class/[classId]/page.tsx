import { notFound } from "next/navigation";
import { getAdminCourse, getCohortsForEnrollment } from "@/app/dashboard/hth-class/course-actions";
import CourseEditorClient from "./CourseEditorClient";

export const dynamic = "force-dynamic";

export default async function AdminCourseEditorPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const id = Number(classId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [course, cohorts] = await Promise.all([getAdminCourse(id), getCohortsForEnrollment()]);
  if (!course) notFound();

  return <CourseEditorClient course={course} cohorts={cohorts} />;
}

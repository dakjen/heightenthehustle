import { notFound } from "next/navigation";
import { getAdminCourse, getCohortsForEnrollment } from "@/app/dashboard/hth-class/course-actions";
import { getAssignmentsForAdmin } from "@/app/dashboard/hth-class/assignment-actions";
import CourseEditorClient, { type Tab } from "./CourseEditorClient";

export const dynamic = "force-dynamic";

const TABS: Tab[] = ["lessons", "details", "enrollment", "submissions"];

export default async function AdminCourseEditorPage({ params, searchParams }: { params: Promise<{ classId: string }>; searchParams: Promise<{ tab?: string }> }) {
  const [{ classId }, { tab }] = await Promise.all([params, searchParams]);
  const initialTab: Tab = TABS.find((t) => t === tab) ?? "lessons";
  const id = Number(classId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [course, cohorts, assignments] = await Promise.all([getAdminCourse(id), getCohortsForEnrollment(), getAssignmentsForAdmin(id)]);
  if (!course) notFound();

  return <CourseEditorClient course={course} cohorts={cohorts} assignments={assignments} initialTab={initialTab} />;
}

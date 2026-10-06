import { getAdminCourses } from "@/app/dashboard/hth-class/course-actions";
import CoursesAdminClient from "./CoursesAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses();
  return <CoursesAdminClient courses={courses} />;
}

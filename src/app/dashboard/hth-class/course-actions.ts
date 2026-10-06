"use server";

import { db } from "@/db";
import {
  classes, lessons, enrollments, lessonProgress, cohorts, cohortWaitlist, users, courseAttachments,
  classTypeEnum, type Class, type Lesson, type Enrollment, type Cohort, type CourseAttachment,
} from "@/db/schema";
import { put, del } from "@vercel/blob";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/login/actions";
import { hasPermission, requirePermission } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { notifyHtml, esc, appUrl } from "@/lib/notify";
import { FormState } from "@/types/form-state";

function text(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}
function revalidateCourses() {
  revalidatePath("/dashboard/hth-class", "layout");
  revalidatePath("/dashboard/admin/hth-class", "layout");
  revalidatePath("/dashboard");
}

// ============================================================================
// Member side
// ============================================================================

export type LessonListItem = Pick<Lesson, "id" | "title" | "summary" | "order" | "durationMinutes" | "videoUrl"> & { completed: boolean };
export type MemberCourse = Class & { lessons: LessonListItem[]; completedCount: number; enrollment: Enrollment & { cohort: Cohort | null }; attachments: CourseAttachment[] };

/** Courses the signed-in member is enrolled in (published only), with per-lesson progress. */
export async function getMyCourses(): Promise<MemberCourse[]> {
  const session = await getSession();
  if (!session?.user) return [];
  try {
    const rows = await db.query.enrollments.findMany({
      where: and(eq(enrollments.userId, session.user.id), inArray(enrollments.status, ["enrolled", "completed"])),
      with: { class: { with: { lessons: { where: eq(lessons.isPublished, true), orderBy: [asc(lessons.order)] } } }, cohort: true },
    });
    const published = rows.filter((r) => r.class.isPublished);
    const lessonIds = published.flatMap((r) => r.class.lessons.map((l) => l.id));
    const done = lessonIds.length
      ? await db.query.lessonProgress.findMany({ where: and(eq(lessonProgress.userId, session.user.id), inArray(lessonProgress.lessonId, lessonIds)), columns: { lessonId: true } })
      : [];
    const doneSet = new Set(done.map((d) => d.lessonId));
    const classIds = published.map((r) => r.class.id);
    const courseFiles = classIds.length
      ? await db.query.courseAttachments.findMany({ where: and(inArray(courseAttachments.classId, classIds), sql`${courseAttachments.lessonId} IS NULL`), orderBy: [asc(courseAttachments.title)] })
      : [];
    return published.map((r) => {
      const { class: c, ...enrollment } = r;
      const ls = c.lessons.map((l) => ({ id: l.id, title: l.title, summary: l.summary, order: l.order, durationMinutes: l.durationMinutes, videoUrl: l.videoUrl, completed: doneSet.has(l.id) }));
      const { lessons: _omit, ...classOnly } = c;
      void _omit;
      return { ...classOnly, lessons: ls, completedCount: ls.filter((l) => l.completed).length, enrollment, attachments: courseFiles.filter((f) => f.classId === c.id) };
    });
  } catch (error) {
    console.error("getMyCourses failed (run `npm run db:apply`?):", error);
    return [];
  }
}

export type LessonView = { lesson: Lesson; course: Pick<Class, "id" | "title">; prev: Pick<Lesson, "id" | "title"> | null; next: Pick<Lesson, "id" | "title"> | null; completed: boolean; index: number; total: number; attachments: CourseAttachment[] };

/** One lesson for the signed-in member. Null if not enrolled, unpublished, or missing. Staff can preview anything. */
export async function getLessonForMember(classId: number, lessonId: number): Promise<LessonView | null> {
  const session = await getSession();
  if (!session?.user) return null;
  const me = session.user;
  const staff = hasPermission(me, "canManageClasses");

  const course = await db.query.classes.findFirst({
    where: eq(classes.id, classId),
    with: { lessons: { orderBy: [asc(lessons.order)] } },
  });
  if (!course) return null;
  if (!staff) {
    if (!course.isPublished) return null;
    const enrolled = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, me.id), eq(enrollments.classId, classId), inArray(enrollments.status, ["enrolled", "completed"])),
      columns: { id: true },
    });
    if (!enrolled) return null;
  }
  const visible = staff ? course.lessons : course.lessons.filter((l) => l.isPublished);
  const index = visible.findIndex((l) => l.id === lessonId);
  if (index === -1) return null;
  const done = await db.query.lessonProgress.findFirst({ where: and(eq(lessonProgress.userId, me.id), eq(lessonProgress.lessonId, lessonId)), columns: { id: true } });
  const pick = (l: Lesson | undefined) => (l ? { id: l.id, title: l.title } : null);
  const attachments = await db.query.courseAttachments.findMany({ where: eq(courseAttachments.lessonId, lessonId), orderBy: [asc(courseAttachments.title)] });
  return {
    attachments,
    lesson: visible[index],
    course: { id: course.id, title: course.title },
    prev: pick(visible[index - 1]),
    next: pick(visible[index + 1]),
    completed: Boolean(done),
    index,
    total: visible.length,
  };
}

export async function setLessonComplete(lessonId: number, completed: boolean): Promise<FormState> {
  const session = await getSession();
  if (!session?.user) return { message: "", error: "Please sign in again." };
  try {
    if (completed) {
      await db.insert(lessonProgress).values({ userId: session.user.id, lessonId }).onConflictDoNothing();
    } else {
      await db.delete(lessonProgress).where(and(eq(lessonProgress.userId, session.user.id), eq(lessonProgress.lessonId, lessonId)));
    }
    // Mark the enrollment completed when every published lesson is done.
    const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId), columns: { classId: true } });
    if (lesson) {
      const all = await db.query.lessons.findMany({ where: and(eq(lessons.classId, lesson.classId), eq(lessons.isPublished, true)), columns: { id: true } });
      const doneRows = all.length ? await db.query.lessonProgress.findMany({ where: and(eq(lessonProgress.userId, session.user.id), inArray(lessonProgress.lessonId, all.map((l) => l.id))), columns: { id: true } }) : [];
      const status = all.length > 0 && doneRows.length === all.length ? "completed" : "enrolled";
      await db.update(enrollments).set({ status }).where(and(eq(enrollments.userId, session.user.id), eq(enrollments.classId, lesson.classId), inArray(enrollments.status, ["enrolled", "completed"])));
    }
    revalidateCourses();
    return { message: completed ? "Marked complete." : "Marked incomplete.", error: "" };
  } catch (error) {
    console.error("setLessonComplete failed:", error);
    return { message: "", error: "Couldn't save progress." };
  }
}

// ============================================================================
// Admin side (requires the classes permission)
// ============================================================================

export type AdminCourse = Class & { lessons: Lesson[]; enrollmentCount: number; teacher: { id: number; name: string } };

export async function getAdminCourses(): Promise<AdminCourse[]> {
  await requirePermission("canManageClasses");
  try {
    const rows = await db.query.classes.findMany({
      orderBy: [desc(classes.isPublished), asc(classes.type), asc(classes.title)],
      with: { lessons: { orderBy: [asc(lessons.order)] }, teacher: { columns: { id: true, name: true } }, enrollments: { columns: { id: true, status: true } } },
    });
    return rows.map(({ enrollments: e, ...c }) => ({ ...c, enrollmentCount: e.filter((x) => x.status === "enrolled" || x.status === "completed").length }));
  } catch (error) {
    console.error("getAdminCourses failed (run `npm run db:apply`?):", error);
    return [];
  }
}

export type AdminCourseDetail = AdminCourse & {
  enrollments: (Enrollment & { user: { id: number; name: string; email: string }; cohort: Cohort | null; completedCount: number })[];
  attachments: CourseAttachment[]; // course-level and lesson-level; filter by lessonId
};

export async function getAdminCourse(classId: number): Promise<AdminCourseDetail | null> {
  await requirePermission("canManageClasses");
  const c = await db.query.classes.findFirst({
    where: eq(classes.id, classId),
    with: {
      lessons: { orderBy: [asc(lessons.order)] },
      teacher: { columns: { id: true, name: true } },
      enrollments: { with: { user: { columns: { id: true, name: true, email: true } }, cohort: true }, orderBy: [desc(enrollments.enrollmentDate)] },
    },
  });
  if (!c) return null;
  const lessonIds = c.lessons.map((l) => l.id);
  const progress = lessonIds.length
    ? await db.select({ userId: lessonProgress.userId, n: sql<number>`count(*)::int` }).from(lessonProgress).where(inArray(lessonProgress.lessonId, lessonIds)).groupBy(lessonProgress.userId)
    : [];
  const byUser = new Map(progress.map((p) => [p.userId, p.n]));
  const attachments = await db.query.courseAttachments.findMany({ where: eq(courseAttachments.classId, classId), orderBy: [asc(courseAttachments.title)] });
  const { enrollments: e, ...rest } = c;
  return {
    ...rest,
    attachments,
    enrollmentCount: e.filter((x) => x.status === "enrolled" || x.status === "completed").length,
    enrollments: e.map((x) => ({ ...x, completedCount: byUser.get(x.userId) ?? 0 })),
  };
}

/** Staff who can be set as a course's teacher: admins and approved team members. */
export async function getTeacherOptions(): Promise<{ id: number; name: string; role: string }[]> {
  await requirePermission("canManageClasses");
  return db.query.users.findMany({
    where: and(eq(users.status, "approved"), inArray(users.role, ["admin", "internal"])),
    columns: { id: true, name: true, role: true },
    orderBy: [asc(users.name)],
  });
}

export async function saveCourse(prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission("canManageClasses");
  const id = Number(text(formData, "id"));
  const teacherIdRaw = text(formData, "teacherId");
  let teacherId = teacherIdRaw ? Number(teacherIdRaw) : user.id;
  const title = text(formData, "title");
  const description = text(formData, "description");
  const type = text(formData, "type") as Class["type"];
  const syllabusUrl = text(formData, "syllabusUrl");
  const isPublished = formData.get("isPublished") === "on";

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Give the course a title.";
  if (!classTypeEnum.enumValues.includes(type)) fieldErrors.type = "Choose a course type.";
  if (teacherIdRaw) {
    const t = await db.query.users.findFirst({ where: and(eq(users.id, teacherId), eq(users.status, "approved"), inArray(users.role, ["admin", "internal"])), columns: { id: true } });
    if (!t) fieldErrors.teacherId = "Choose a team member.";
    else teacherId = t.id;
  }
  if (Object.keys(fieldErrors).length) return { message: "", error: "Please fix the highlighted fields.", fieldErrors };

  try {
    if (id) {
      await db.update(classes).set({ title, description: description || null, type, syllabusUrl: syllabusUrl || null, isPublished, teacherId, updatedAt: new Date() }).where(eq(classes.id, id));
      revalidateCourses();
      return { message: "Course saved.", error: "", businessId: id };
    }
    const [created] = await db.insert(classes).values({ title, description: description || null, type, syllabusUrl: syllabusUrl || null, isPublished, teacherId }).returning({ id: classes.id });
    revalidateCourses();
    return { message: "Course created.", error: "", businessId: created.id };
  } catch (error) {
    console.error("saveCourse failed:", error);
    return { message: "", error: "Failed to save the course." };
  }
}

export async function setCoursePublished(classId: number, isPublished: boolean): Promise<FormState> {
  await requirePermission("canManageClasses");
  await db.update(classes).set({ isPublished, updatedAt: new Date() }).where(eq(classes.id, classId));
  revalidateCourses();
  return { message: isPublished ? "Course is now visible to enrolled members." : "Course hidden from members.", error: "" };
}

export async function deleteCourse(classId: number): Promise<FormState> {
  await requirePermission("canManageClasses");
  try {
    const ls = await db.query.lessons.findMany({ where: eq(lessons.classId, classId), columns: { id: true } });
    if (ls.length) await db.delete(lessonProgress).where(inArray(lessonProgress.lessonId, ls.map((l) => l.id)));
    await db.delete(enrollments).where(eq(enrollments.classId, classId));
    await db.delete(lessons).where(eq(lessons.classId, classId));
    await db.delete(classes).where(eq(classes.id, classId));
    revalidateCourses();
    return { message: "Course deleted.", error: "" };
  } catch (error) {
    console.error("deleteCourse failed:", error);
    return { message: "", error: "Failed to delete the course." };
  }
}

export async function saveLesson(prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("canManageClasses");
  const id = Number(text(formData, "id"));
  const classId = Number(text(formData, "classId"));
  const title = text(formData, "title");
  const summary = text(formData, "summary");
  const content = text(formData, "content").replace(/\r\n?/g, "\n"); // normalize textarea line endings
  const videoUrl = text(formData, "videoUrl");
  const durationRaw = text(formData, "durationMinutes");
  const isPublished = formData.get("isPublished") !== "off";

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Give the lesson a title.";
  if (!classId) fieldErrors.classId = "Missing course.";
  if (videoUrl && !/^https?:\/\//i.test(videoUrl)) fieldErrors.videoUrl = "Paste the full link, starting with https://";
  if (durationRaw && !/^\d{1,3}$/.test(durationRaw)) fieldErrors.durationMinutes = "Minutes, numbers only.";
  if (Object.keys(fieldErrors).length) return { message: "", error: "Please fix the highlighted fields.", fieldErrors };

  const values = { title, summary: summary || null, content: content || null, videoUrl: videoUrl || null, durationMinutes: durationRaw ? Number(durationRaw) : null, isPublished, updatedAt: new Date() };
  try {
    if (id) {
      await db.update(lessons).set(values).where(and(eq(lessons.id, id), eq(lessons.classId, classId)));
      revalidateCourses();
      return { message: "Lesson saved.", error: "", businessId: id };
    }
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max("order"), 0)::int` }).from(lessons).where(eq(lessons.classId, classId));
    const [created] = await db.insert(lessons).values({ ...values, classId, order: max + 1 }).returning({ id: lessons.id });
    revalidateCourses();
    return { message: "Lesson added.", error: "", businessId: created.id };
  } catch (error) {
    console.error("saveLesson failed:", error);
    return { message: "", error: "Failed to save the lesson." };
  }
}

export async function deleteLesson(lessonId: number): Promise<FormState> {
  await requirePermission("canManageClasses");
  try {
    await db.delete(lessonProgress).where(eq(lessonProgress.lessonId, lessonId));
    await db.delete(lessons).where(eq(lessons.id, lessonId));
    revalidateCourses();
    return { message: "Lesson deleted.", error: "" };
  } catch (error) {
    console.error("deleteLesson failed:", error);
    return { message: "", error: "Failed to delete the lesson." };
  }
}

/** Persist a new lesson order: ids in display order. */
export async function reorderLessons(classId: number, orderedIds: number[]): Promise<FormState> {
  await requirePermission("canManageClasses");
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.update(lessons).set({ order: i + 1 }).where(and(eq(lessons.id, orderedIds[i]), eq(lessons.classId, classId)));
    }
    revalidateCourses();
    return { message: "Order saved.", error: "" };
  } catch (error) {
    console.error("reorderLessons failed:", error);
    return { message: "", error: "Failed to reorder." };
  }
}

// ---------- Enrollment ----------

export type EnrollCandidate = { userId: number; name: string; email: string; onWaitlist: boolean; businessName: string | null };

/** Approved members who are not yet enrolled in this course, flagged if they're on the given cohort's waitlist. */
export async function getEnrollCandidates(classId: number, cohortId?: number): Promise<EnrollCandidate[]> {
  await requirePermission("canManageClasses");
  const [members, already, wait] = await Promise.all([
    db.query.users.findMany({ where: and(eq(users.role, "external"), eq(users.status, "approved")), columns: { id: true, name: true, email: true, businessName: true }, orderBy: [asc(users.name)] }),
    db.query.enrollments.findMany({ where: and(eq(enrollments.classId, classId), inArray(enrollments.status, ["enrolled", "completed", "pending"])), columns: { userId: true } }),
    cohortId ? db.query.cohortWaitlist.findMany({ where: eq(cohortWaitlist.cohortId, cohortId), columns: { userId: true, email: true } }) : Promise.resolve([]),
  ]);
  const taken = new Set(already.map((e) => e.userId));
  const waitIds = new Set(wait.map((w) => w.userId));
  const waitEmails = new Set(wait.map((w) => w.email.toLowerCase()));
  return members
    .filter((m) => !taken.has(m.id))
    .map((m) => ({ userId: m.id, name: m.name, email: m.email, businessName: m.businessName, onWaitlist: waitIds.has(m.id) || waitEmails.has(m.email.toLowerCase()) }))
    .sort((a, b) => Number(b.onWaitlist) - Number(a.onWaitlist) || a.name.localeCompare(b.name));
}

export async function getCohortsForEnrollment(): Promise<Pick<Cohort, "id" | "name" | "startDate">[]> {
  await requirePermission("canManageClasses");
  return db.query.cohorts.findMany({ columns: { id: true, name: true, startDate: true }, orderBy: [desc(cohorts.startDate)] });
}

/** Enroll members (optionally into a cohort) and email each of them. */
export async function enrollMembers(classId: number, userIds: number[], cohortId: number | null): Promise<FormState> {
  await requirePermission("canManageClasses");
  if (!userIds.length) return { message: "", error: "Pick at least one member." };
  try {
    const course = await db.query.classes.findFirst({ where: eq(classes.id, classId), columns: { title: true } });
    if (!course) return { message: "", error: "Course not found." };
    const cohort = cohortId ? await db.query.cohorts.findFirst({ where: eq(cohorts.id, cohortId) }) : null;

    await db.insert(enrollments).values(userIds.map((userId) => ({ userId, classId, cohortId, status: "enrolled" as const }))).onConflictDoNothing();
    // If someone had a pending/dropped row, promote it.
    await db.update(enrollments).set({ status: "enrolled", cohortId }).where(and(eq(enrollments.classId, classId), inArray(enrollments.userId, userIds), inArray(enrollments.status, ["pending", "dropped", "rejected"])));

    const people = await db.query.users.findMany({ where: inArray(users.id, userIds), columns: { email: true, name: true } });
    const link = { href: `${appUrl()}/dashboard/hth-class`, label: "Open the course" };
    const start = cohort?.startDate ? new Date(cohort.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;
    await Promise.all(people.map((p) => sendEmail({
      to: { email: p.email, name: p.name },
      subject: `You're enrolled: ${course.title}`,
      text: `Hi ${p.name},\n\nYou're enrolled in ${course.title}${cohort ? ` (${cohort.name}${start ? `, starting ${start}` : ""})` : ""}. Sign in to the portal to start the lessons.\n\n${link.href}`,
      html: notifyHtml("You're enrolled", `<p>Hi ${esc(p.name)},</p><p>You're enrolled in <strong>${esc(course.title)}</strong>${cohort ? ` as part of <strong>${esc(cohort.name)}</strong>${start ? `, starting ${esc(start)}` : ""}` : ""}. Sign in to start the lessons.</p>`, link),
    })));

    revalidateCourses();
    return { message: `Enrolled ${userIds.length} member${userIds.length === 1 ? "" : "s"} and sent them an email.`, error: "" };
  } catch (error) {
    console.error("enrollMembers failed:", error);
    return { message: "", error: "Failed to enroll." };
  }
}

export async function setEnrollmentStatus(enrollmentId: number, status: Enrollment["status"]): Promise<FormState> {
  await requirePermission("canManageClasses");
  await db.update(enrollments).set({ status }).where(eq(enrollments.id, enrollmentId));
  revalidateCourses();
  return { message: "Updated.", error: "" };
}

// ---------- Attachments (templates, worksheets, slides) ----------

const ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024;

/** FormData: classId, lessonId (optional), title, file. Stored on public blob storage (course materials are not sensitive). */
export async function uploadAttachment(prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission("canManageClasses");
  const classId = Number(text(formData, "classId"));
  const lessonIdRaw = text(formData, "lessonId");
  const lessonId = lessonIdRaw ? Number(lessonIdRaw) : null;
  const file = formData.get("file");
  let title = text(formData, "title");

  const fieldErrors: Record<string, string> = {};
  if (!classId) fieldErrors.classId = "Missing course.";
  if (!(file instanceof File) || file.size === 0) fieldErrors.file = "Choose a file.";
  else if (file.size > ATTACHMENT_MAX_BYTES) fieldErrors.file = "File must be 25 MB or smaller.";
  if (Object.keys(fieldErrors).length) return { message: "", error: "Please fix the highlighted fields.", fieldErrors };
  const upload = file as File;
  if (!title) title = upload.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");

  try {
    if (lessonId) {
      const owned = await db.query.lessons.findFirst({ where: and(eq(lessons.id, lessonId), eq(lessons.classId, classId)), columns: { id: true } });
      if (!owned) return { message: "", error: "That lesson isn't in this course." };
    }
    const safeName = upload.name.replace(/[^\w.-]+/g, "_");
    const blob = await put(`course-materials/${classId}/${Date.now()}-${safeName}`, upload, { access: "public" });
    await db.insert(courseAttachments).values({
      classId, lessonId, title, fileName: upload.name, url: blob.url,
      contentType: upload.type || "application/octet-stream", sizeBytes: upload.size, uploadedById: user.id,
    });
    revalidateCourses();
    return { message: `"${title}" uploaded.`, error: "" };
  } catch (error) {
    console.error("uploadAttachment failed:", error);
    return { message: "", error: "Upload failed. Please try again." };
  }
}

export async function deleteAttachment(id: number): Promise<FormState> {
  await requirePermission("canManageClasses");
  const row = await db.query.courseAttachments.findFirst({ where: eq(courseAttachments.id, id) });
  if (!row) return { message: "", error: "File not found." };
  try {
    await del(row.url);
  } catch (error) {
    console.warn("Blob delete failed (removing record anyway):", error);
  }
  await db.delete(courseAttachments).where(eq(courseAttachments.id, id));
  revalidateCourses();
  return { message: "File removed.", error: "" };
}

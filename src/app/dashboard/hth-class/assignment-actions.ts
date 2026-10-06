"use server";

import { db } from "@/db";
import {
  assignments, assignmentSubmissions, enrollments, lessons, classes, users,
  type Assignment, type AssignmentSubmission, type Cohort,
} from "@/db/schema";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { put, del } from "@vercel/blob";
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
function revalidate() {
  revalidatePath("/dashboard/hth-class", "layout");
  revalidatePath("/dashboard/admin/hth-class", "layout");
}
const SUBMISSION_MAX_BYTES = 25 * 1024 * 1024;

// ============================================================================
// Member
// ============================================================================

export type MemberAssignment = Assignment & { submission: AssignmentSubmission | null; lessonTitle: string | null };

/** Published assignments for a lesson (or the whole course when lessonId is null), with the member's own submission. */
export async function getMyAssignments(classId: number, lessonId: number | null): Promise<MemberAssignment[]> {
  const session = await getSession();
  if (!session?.user) return [];
  const me = session.user;
  const staff = hasPermission(me, "canManageClasses");
  if (!staff) {
    const enrolled = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, me.id), eq(enrollments.classId, classId), inArray(enrollments.status, ["enrolled", "completed"])),
      columns: { id: true },
    });
    if (!enrolled) return [];
  }
  try {
    const rows = await db.query.assignments.findMany({
      where: and(eq(assignments.classId, classId), lessonId === null ? sql`true` : eq(assignments.lessonId, lessonId), staff ? sql`true` : eq(assignments.isPublished, true)),
      orderBy: [asc(assignments.order), asc(assignments.id)],
      with: { lesson: { columns: { title: true } } },
    });
    const ids = rows.map((r) => r.id);
    const mine = ids.length ? await db.query.assignmentSubmissions.findMany({ where: and(eq(assignmentSubmissions.userId, me.id), inArray(assignmentSubmissions.assignmentId, ids)) }) : [];
    const byAssignment = new Map(mine.map((m) => [m.assignmentId, m]));
    return rows.map(({ lesson, ...a }) => ({ ...a, submission: byAssignment.get(a.id) ?? null, lessonTitle: lesson?.title ?? null }));
  } catch (error) {
    console.error("getMyAssignments failed (run `npm run db:apply`?):", error);
    return [];
  }
}

/** Submit or resubmit. FormData: assignmentId, text, file. */
export async function submitAssignment(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session?.user) return { message: "", error: "Please sign in again." };
  const me = session.user;
  const assignmentId = Number(text(formData, "assignmentId"));
  const body = text(formData, "text");
  const file = formData.get("file");
  const hasFile = file instanceof File && file.size > 0;

  const a = await db.query.assignments.findFirst({ where: eq(assignments.id, assignmentId), with: { class: { columns: { title: true, teacherId: true } } } });
  if (!a || !a.isPublished) return { message: "", error: "This assignment isn't available." };
  const enrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, me.id), eq(enrollments.classId, a.classId), inArray(enrollments.status, ["enrolled", "completed"])),
    columns: { cohortId: true },
  });
  if (!enrollment) return { message: "", error: "You're not enrolled in this course." };

  const fieldErrors: Record<string, string> = {};
  if (!body && !hasFile) fieldErrors.text = a.allowsFile ? "Write your answer or attach a file." : "Write your answer.";
  if (hasFile && !a.allowsFile) fieldErrors.file = "This assignment doesn't take file uploads.";
  if (hasFile && (file as File).size > SUBMISSION_MAX_BYTES) fieldErrors.file = "File must be 25 MB or smaller.";
  if (Object.keys(fieldErrors).length) return { message: "", error: "Please fix the highlighted fields.", fieldErrors };

  try {
    const existing = await db.query.assignmentSubmissions.findFirst({ where: and(eq(assignmentSubmissions.assignmentId, assignmentId), eq(assignmentSubmissions.userId, me.id)) });
    let filePatch: Partial<AssignmentSubmission> = {};
    if (hasFile) {
      const f = file as File;
      const safeName = f.name.replace(/[^\w.-]+/g, "_");
      const blob = await put(`submissions/${a.classId}/${me.id}/${Date.now()}-${safeName}`, f, { access: "private", addRandomSuffix: true });
      if (existing?.fileBlobPathname) { try { await del(existing.fileBlobPathname); } catch { /* ignore */ } }
      filePatch = { fileName: f.name, fileBlobPathname: blob.pathname, fileContentType: f.type || "application/octet-stream", fileSizeBytes: f.size };
    }
    const values = { text: body || existing?.text || null, ...filePatch, status: "submitted" as const, score: null, feedback: existing?.feedback ?? null, updatedAt: new Date(), submittedAt: new Date(), cohortId: enrollment.cohortId };
    if (existing) {
      await db.update(assignmentSubmissions).set(values).where(eq(assignmentSubmissions.id, existing.id));
    } else {
      await db.insert(assignmentSubmissions).values({ assignmentId, userId: me.id, ...values });
    }

    // Tell the teacher.
    const teacher = await db.query.users.findFirst({ where: eq(users.id, a.class.teacherId), columns: { email: true, name: true } });
    if (teacher) {
      const link = { href: `${appUrl()}/dashboard/admin/hth-class/${a.classId}?tab=submissions`, label: "Review submissions" };
      await sendEmail({
        to: { email: teacher.email, name: teacher.name },
        subject: `${existing ? "Resubmission" : "New submission"}: ${a.title} — ${me.name}`,
        text: `${me.name} submitted "${a.title}" in ${a.class.title}.\n\n${link.href}`,
        html: notifyHtml(`${esc(me.name)} submitted “${esc(a.title)}”`, `<p>Course: ${esc(a.class.title)}</p>${body ? `<blockquote>${esc(body.slice(0, 400))}${body.length > 400 ? "…" : ""}</blockquote>` : ""}${hasFile ? `<p>Attached: ${esc((file as File).name)}</p>` : ""}`, link),
      });
    }
    revalidate();
    return { message: existing ? "Resubmitted. Your teacher has been notified." : "Submitted. Your teacher has been notified.", error: "" };
  } catch (error) {
    console.error("submitAssignment failed:", error);
    return { message: "", error: "Couldn't submit. Please try again." };
  }
}

// ============================================================================
// Admin / teacher
// ============================================================================

export async function saveAssignment(prevState: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("canManageClasses");
  const id = Number(text(formData, "id"));
  const classId = Number(text(formData, "classId"));
  const lessonIdRaw = text(formData, "lessonId");
  const lessonId = lessonIdRaw ? Number(lessonIdRaw) : null;
  const title = text(formData, "title");
  const instructions = text(formData, "instructions");
  const dueDate = text(formData, "dueDate");
  const pointsRaw = text(formData, "points");
  const allowsText = formData.get("allowsText") !== "off";
  const allowsFile = formData.get("allowsFile") !== "off";
  const isPublished = formData.get("isPublished") !== "off";

  const fieldErrors: Record<string, string> = {};
  if (!classId) fieldErrors.classId = "Missing course.";
  if (!title) fieldErrors.title = "Give the assignment a title.";
  if (dueDate && Number.isNaN(Date.parse(dueDate))) fieldErrors.dueDate = "Enter a valid date.";
  if (pointsRaw && !/^\d{1,4}$/.test(pointsRaw)) fieldErrors.points = "Whole number of points.";
  if (!allowsText && !allowsFile) fieldErrors.allowsText = "Allow a written answer, a file, or both.";
  if (Object.keys(fieldErrors).length) return { message: "", error: "Please fix the highlighted fields.", fieldErrors };
  if (lessonId) {
    const ok = await db.query.lessons.findFirst({ where: and(eq(lessons.id, lessonId), eq(lessons.classId, classId)), columns: { id: true } });
    if (!ok) return { message: "", error: "That lesson isn't in this course." };
  }
  const values = { title, instructions: instructions || null, dueDate: dueDate ? new Date(`${dueDate}T23:59:00`) : null, points: pointsRaw ? Number(pointsRaw) : null, allowsText, allowsFile, isPublished };
  try {
    if (id) {
      await db.update(assignments).set(values).where(and(eq(assignments.id, id), eq(assignments.classId, classId)));
      revalidate();
      return { message: "Assignment saved.", error: "", businessId: id };
    }
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max("order"), 0)::int` }).from(assignments).where(eq(assignments.classId, classId));
    const [created] = await db.insert(assignments).values({ ...values, classId, lessonId, order: max + 1 }).returning({ id: assignments.id });
    revalidate();
    return { message: "Assignment added.", error: "", businessId: created.id };
  } catch (error) {
    console.error("saveAssignment failed:", error);
    return { message: "", error: "Failed to save the assignment." };
  }
}

export async function deleteAssignment(id: number): Promise<FormState> {
  await requirePermission("canManageClasses");
  try {
    const subs = await db.query.assignmentSubmissions.findMany({ where: eq(assignmentSubmissions.assignmentId, id), columns: { fileBlobPathname: true } });
    await Promise.all(subs.filter((s) => s.fileBlobPathname).map((s) => del(s.fileBlobPathname!).catch(() => undefined)));
    await db.delete(assignments).where(eq(assignments.id, id));
    revalidate();
    return { message: "Assignment deleted.", error: "" };
  } catch (error) {
    console.error("deleteAssignment failed:", error);
    return { message: "", error: "Failed to delete." };
  }
}

export async function getAssignmentsForAdmin(classId: number): Promise<(Assignment & { lessonTitle: string | null; submissionCount: number; ungradedCount: number })[]> {
  await requirePermission("canManageClasses");
  const rows = await db.query.assignments.findMany({
    where: eq(assignments.classId, classId),
    orderBy: [asc(assignments.order), asc(assignments.id)],
    with: { lesson: { columns: { title: true } }, submissions: { columns: { status: true } } },
  });
  return rows.map(({ lesson, submissions, ...a }) => ({ ...a, lessonTitle: lesson?.title ?? null, submissionCount: submissions.length, ungradedCount: submissions.filter((s) => s.status === "submitted").length }));
}

export type SubmissionRow = AssignmentSubmission & {
  user: { id: number; name: string; email: string };
  cohort: Pick<Cohort, "id" | "name"> | null;
  assignment: Pick<Assignment, "id" | "title" | "points" | "lessonId">;
};

/** All submissions for a course, optionally narrowed by cohort and/or assignment. */
export async function getSubmissions(classId: number, filter: { cohortId?: number | null; assignmentId?: number | null; onlyUngraded?: boolean } = {}): Promise<SubmissionRow[]> {
  await requirePermission("canManageClasses");
  const ids = (await db.query.assignments.findMany({ where: eq(assignments.classId, classId), columns: { id: true } })).map((a) => a.id);
  if (!ids.length) return [];
  const conds = [inArray(assignmentSubmissions.assignmentId, ids)];
  if (filter.assignmentId) conds.push(eq(assignmentSubmissions.assignmentId, filter.assignmentId));
  if (filter.cohortId) conds.push(eq(assignmentSubmissions.cohortId, filter.cohortId));
  if (filter.onlyUngraded) conds.push(eq(assignmentSubmissions.status, "submitted"));
  return db.query.assignmentSubmissions.findMany({
    where: and(...conds),
    orderBy: [desc(assignmentSubmissions.submittedAt)],
    with: {
      user: { columns: { id: true, name: true, email: true } },
      cohort: { columns: { id: true, name: true } },
      assignment: { columns: { id: true, title: true, points: true, lessonId: true } },
    },
  });
}

/** Grade and give feedback; emails the member. */
export async function gradeSubmission(submissionId: number, patch: { score?: number | null; feedback?: string; status?: "graded" | "returned" }): Promise<FormState> {
  const grader = await requirePermission("canManageClasses");
  const sub = await db.query.assignmentSubmissions.findFirst({ where: eq(assignmentSubmissions.id, submissionId), with: { user: { columns: { email: true, name: true } }, assignment: { columns: { title: true, points: true, classId: true } } } });
  if (!sub) return { message: "", error: "Submission not found." };
  const status = patch.status ?? "graded";
  try {
    await db.update(assignmentSubmissions).set({ score: patch.score ?? null, feedback: patch.feedback ?? null, status, gradedById: grader.id, gradedAt: new Date(), updatedAt: new Date() }).where(eq(assignmentSubmissions.id, submissionId));
    const link = { href: `${appUrl()}/dashboard/hth-class/${sub.assignment.classId}`, label: "See your feedback" };
    const scoreLine = patch.score != null ? `Score: ${patch.score}${sub.assignment.points ? ` / ${sub.assignment.points}` : ""}` : "";
    await sendEmail({
      to: { email: sub.user.email, name: sub.user.name },
      subject: `${status === "returned" ? "Please revise" : "Feedback on"}: ${sub.assignment.title}`,
      text: `Hi ${sub.user.name},\n\n${status === "returned" ? "Your teacher asked for a revision on" : "Your teacher reviewed"} "${sub.assignment.title}".\n${scoreLine}\n\n${patch.feedback ?? ""}\n\n${link.href}`,
      html: notifyHtml(status === "returned" ? "Please revise and resubmit" : "Your assignment was reviewed", `<p>Hi ${esc(sub.user.name)},</p><p><strong>${esc(sub.assignment.title)}</strong></p>${scoreLine ? `<p>${esc(scoreLine)}</p>` : ""}${patch.feedback ? `<blockquote>${esc(patch.feedback).replace(/\n/g, "<br/>")}</blockquote>` : ""}`, link),
    });
    revalidate();
    return { message: "Saved and sent to the member.", error: "" };
  } catch (error) {
    console.error("gradeSubmission failed:", error);
    return { message: "", error: "Failed to save the grade." };
  }
}

/** Teachers who can grade: the course's teacher plus any staff with the classes permission. */
export async function getCourseTeacher(classId: number): Promise<{ id: number; name: string } | null> {
  const c = await db.query.classes.findFirst({ where: eq(classes.id, classId), with: { teacher: { columns: { id: true, name: true } } } });
  return c?.teacher ?? null;
}

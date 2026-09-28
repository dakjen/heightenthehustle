"use server";

import { db } from "@/db";
import { cohorts, cohortWaitlist, cohortStatusEnum, type Cohort, type CohortWaitlistEntry } from "@/db/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/login/actions";
import { requirePermission } from "@/lib/auth";
import { FormState } from "@/types/form-state";
import { sendEmail } from "@/lib/email";
import { notifyApprovers, notifyHtml, esc, appUrl } from "@/lib/notify";

function text(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

// ---------- Member-facing ----------

/** The cohort members should be pointed at: the soonest one with an open waitlist. */
export async function getFeaturedCohort(): Promise<Cohort | null> {
  try {
    const rows = await db.query.cohorts.findMany({
      where: eq(cohorts.isWaitlistOpen, true),
      orderBy: [asc(cohorts.startDate), asc(cohorts.id)],
      limit: 1,
    });
    return rows[0] ?? null;
  } catch (error) {
    // Most likely the cohorts tables haven't been pushed yet; treat as "no cohort".
    console.error("getFeaturedCohort failed:", error);
    return null;
  }
}

export async function getMyWaitlistEntry(cohortId: number): Promise<CohortWaitlistEntry | null> {
  const session = await getSession();
  if (!session?.user) return null;
  try {
    const entry = await db.query.cohortWaitlist.findFirst({
      where: and(eq(cohortWaitlist.cohortId, cohortId), eq(cohortWaitlist.email, session.user.email.toLowerCase())),
    });
    return entry ?? null;
  } catch (error) {
    console.error("getMyWaitlistEntry failed:", error);
    return null;
  }
}

export async function joinWaitlist(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session?.user) {
    return { message: "", error: "Please sign in to join the waitlist." };
  }

  const cohortId = Number(text(formData, "cohortId"));
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone");
  const businessName = text(formData, "businessName");
  const notes = text(formData, "notes");

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Enter your name.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (phone && phone.replace(/\D/g, "").length < 10) fieldErrors.phone = "Enter a 10-digit phone number.";
  if (Object.keys(fieldErrors).length > 0) {
    return { message: "", error: "Please fix the highlighted fields.", fieldErrors };
  }

  const cohort = await db.query.cohorts.findFirst({ where: eq(cohorts.id, cohortId) });
  if (!cohort || !cohort.isWaitlistOpen) {
    return { message: "", error: "This waitlist isn't open right now." };
  }

  try {
    await db
      .insert(cohortWaitlist)
      .values({ cohortId, userId: session.user.id, name, email, phone: phone || null, businessName: businessName || null, notes: notes || null })
      .onConflictDoNothing();
    // Confirmation to the member, heads-up to the team. Neither can fail the join.
    const start = cohort.startDate ? new Date(cohort.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "soon";
    await sendEmail({
      to: { email, name },
      subject: `You're on the ${cohort.name} waitlist`,
      text: `Hi ${name},\n\nYou're on the waitlist for ${cohort.name}, starting ${start}. We'll email you as soon as enrollment opens.\n\n${appUrl()}/dashboard/hth-class`,
      html: notifyHtml("You're on the list", `<p>Hi ${esc(name)},</p><p>You're on the waitlist for <strong>${esc(cohort.name)}</strong>, starting ${esc(start)}. We'll email you as soon as enrollment opens.</p>`, { href: `${appUrl()}/dashboard/hth-class`, label: "View the cohort" }),
    });
    await notifyApprovers(
      `Waitlist: ${name} joined ${cohort.name}`,
      `${name} (${email}${phone ? `, ${phone}` : ""}) joined the ${cohort.name} waitlist.${businessName ? `\nBusiness: ${businessName}` : ""}${notes ? `\nNotes: ${notes}` : ""}\n\n${appUrl()}/dashboard/admin/hth-class/cohorts`,
      notifyHtml(`${esc(name)} joined the ${esc(cohort.name)} waitlist`, `<p><strong>Email:</strong> ${esc(email)}<br/>${phone ? `<strong>Phone:</strong> ${esc(phone)}<br/>` : ""}${businessName ? `<strong>Business:</strong> ${esc(businessName)}<br/>` : ""}${notes ? `<strong>Notes:</strong> ${esc(notes)}` : ""}</p>`, { href: `${appUrl()}/dashboard/admin/hth-class/cohorts`, label: "See the waitlist" }),
    );

    revalidatePath("/dashboard/hth-class");
    revalidatePath("/dashboard");
    return { message: `You're on the waitlist for ${cohort.name}. We'll email you when enrollment opens.`, error: "" };
  } catch (error) {
    console.error("Error joining waitlist:", error);
    return { message: "", error: "Something went wrong. Please try again." };
  }
}

// ---------- Admin ----------

export type CohortWithWaitlist = Cohort & { waitlist: CohortWaitlistEntry[] };

export async function getCohortsWithWaitlist(): Promise<CohortWithWaitlist[]> {
  await requirePermission("canManageClasses");
  try {
    return await db.query.cohorts.findMany({
      orderBy: [desc(cohorts.isWaitlistOpen), asc(cohorts.startDate), desc(cohorts.id)],
      with: { waitlist: { orderBy: [asc(cohortWaitlist.createdAt)] } },
    });
  } catch (error) {
    console.error("getCohortsWithWaitlist failed (run `npm run db:push`?):", error);
    return [];
  }
}

export async function createCohort(prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await requirePermission("canManageClasses");

  const name = text(formData, "name");
  const description = text(formData, "description");
  const startDate = text(formData, "startDate");
  const endDate = text(formData, "endDate");
  const isWaitlistOpen = formData.get("isWaitlistOpen") === "on";

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Give the cohort a name.";
  if (!startDate) fieldErrors.startDate = "Pick a start date.";
  if (startDate && endDate && endDate < startDate) fieldErrors.endDate = "End date must be after the start date.";
  if (Object.keys(fieldErrors).length > 0) {
    return { message: "", error: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    await db.insert(cohorts).values({
      name,
      description: description || null,
      startDate: new Date(`${startDate}T12:00:00`),
      endDate: endDate ? new Date(`${endDate}T12:00:00`) : null,
      isWaitlistOpen,
      status: "upcoming",
      createdById: user.id,
    });
    revalidatePath("/dashboard/admin/hth-class/cohorts");
    revalidatePath("/dashboard/hth-class");
    revalidatePath("/dashboard");
    return { message: `${name} created.`, error: "" };
  } catch (error) {
    console.error("Error creating cohort:", error);
    return { message: "", error: "Failed to create cohort." };
  }
}

export async function updateCohortStatus(cohortId: number, status: Cohort["status"], isWaitlistOpen: boolean): Promise<FormState> {
  await requirePermission("canManageClasses");
  if (!cohortStatusEnum.enumValues.includes(status)) {
    return { message: "", error: "Invalid status." };
  }
  try {
    await db.update(cohorts).set({ status, isWaitlistOpen }).where(eq(cohorts.id, cohortId));
    revalidatePath("/dashboard/admin/hth-class/cohorts");
    revalidatePath("/dashboard/hth-class");
    return { message: "Cohort updated.", error: "" };
  } catch (error) {
    console.error("Error updating cohort:", error);
    return { message: "", error: "Failed to update cohort." };
  }
}

export async function deleteCohort(cohortId: number): Promise<FormState> {
  await requirePermission("canManageClasses");
  try {
    await db.delete(cohorts).where(eq(cohorts.id, cohortId));
    revalidatePath("/dashboard/admin/hth-class/cohorts");
    revalidatePath("/dashboard/hth-class");
    return { message: "Cohort deleted.", error: "" };
  } catch (error) {
    console.error("Error deleting cohort:", error);
    return { message: "", error: "Failed to delete cohort." };
  }
}

export async function removeWaitlistEntry(entryId: number): Promise<FormState> {
  await requirePermission("canManageClasses");
  try {
    await db.delete(cohortWaitlist).where(eq(cohortWaitlist.id, entryId));
    revalidatePath("/dashboard/admin/hth-class/cohorts");
    return { message: "Removed from waitlist.", error: "" };
  } catch (error) {
    console.error("Error removing waitlist entry:", error);
    return { message: "", error: "Failed to remove entry." };
  }
}

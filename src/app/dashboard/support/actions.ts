"use server";

import { db } from "@/db";
import { supportRequests, supportCategoryEnum, supportUrgencyEnum, supportStatusEnum, users, businesses, type SupportRequest } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/app/login/actions";
import { canAccessAdminArea, requireUser } from "@/lib/auth";
import { sendEmail, appUrl } from "@/lib/email";
import { FormState } from "@/types/form-state";

function text(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

export type SupportCategory = SupportRequest["category"];
export type SupportStatus = SupportRequest["status"];

// ---------- Member ----------

export async function getMySupportRequests(): Promise<SupportRequest[]> {
  const session = await getSession();
  if (!session?.user) return [];
  try {
    return await db.query.supportRequests.findMany({
      where: eq(supportRequests.userId, session.user.id),
      orderBy: [desc(supportRequests.createdAt)],
    });
  } catch (error) {
    console.error("getMySupportRequests failed (run `npm run db:apply`?):", error);
    return [];
  }
}

export async function createSupportRequest(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session?.user) return { message: "", error: "Please sign in again." };
  const user = session.user;

  const category = text(formData, "category") as SupportCategory;
  const subject = text(formData, "subject");
  const details = text(formData, "details");
  const amountNeeded = text(formData, "amountNeeded");
  const neededBy = text(formData, "neededBy");
  const urgency = (text(formData, "urgency") || "normal") as SupportRequest["urgency"];
  const businessIdRaw = text(formData, "businessId");
  const businessId = businessIdRaw ? Number(businessIdRaw) : null;

  const fieldErrors: Record<string, string> = {};
  if (!supportCategoryEnum.enumValues.includes(category)) fieldErrors.category = "Choose what kind of help you need.";
  if (!subject) fieldErrors.subject = "Give your request a short title.";
  if (details.length < 20) fieldErrors.details = "Tell us a bit more (at least a couple of sentences).";
  if (!supportUrgencyEnum.enumValues.includes(urgency)) fieldErrors.urgency = "Choose an urgency.";
  if (neededBy && Number.isNaN(Date.parse(neededBy))) fieldErrors.neededBy = "Enter a valid date.";
  if (Object.keys(fieldErrors).length) return { message: "", error: "Please fix the highlighted fields.", fieldErrors };

  // Only allow attaching one of the member's own businesses.
  if (businessId !== null) {
    const owned = await db.query.businesses.findFirst({ where: and(eq(businesses.id, businessId), eq(businesses.userId, user.id)), columns: { id: true } });
    if (!owned) return { message: "", error: "That business isn't on your account." };
  }

  try {
    const [created] = await db
      .insert(supportRequests)
      .values({
        userId: user.id,
        businessId,
        category,
        subject,
        details,
        amountNeeded: amountNeeded || null,
        neededBy: neededBy ? new Date(`${neededBy}T12:00:00`) : null,
        urgency,
      })
      .returning({ id: supportRequests.id });

    // Let the team know. Never fails the request if email is down.
    try {
      const admins = await db.query.users.findMany({ where: eq(users.role, "admin"), columns: { email: true, name: true } });
      const link = `${appUrl()}/dashboard/admin/support`;
      await Promise.all(
        admins.map((a) =>
          sendEmail({
            to: { email: a.email, name: a.name },
            subject: `${urgency === "high" ? "URGENT: " : ""}Support request: ${subject} (${category})`,
            text: `${user.name} (${user.email}) submitted a ${urgency}-urgency support request.\n\nCategory: ${category}\nSubject: ${subject}\n\n${details}\n\nReview it: ${link}`,
            html: `<p><strong>${user.name}</strong> (${user.email}) submitted a <strong>${urgency}</strong>-urgency support request.</p><p><strong>Category:</strong> ${category}<br/><strong>Subject:</strong> ${subject}</p><p>${details.replace(/\n/g, "<br/>")}</p><p><a href="${link}">Review it in the portal</a></p>`,
          }),
        ),
      );
    } catch (error) {
      console.warn("Support request email failed:", error);
    }

    revalidatePath("/dashboard/support");
    revalidatePath("/dashboard/admin/support");
    revalidatePath("/dashboard");
    return { message: "Request sent. Our team will follow up by email or in Messages.", error: "", businessId: created.id };
  } catch (error) {
    console.error("createSupportRequest failed:", error);
    return { message: "", error: "Something went wrong sending your request. Please try again." };
  }
}

// ---------- Admin ----------

export type SupportRequestWithUser = SupportRequest & {
  user: { id: number; name: string; email: string; phone: string };
  business: { id: number; businessName: string } | null;
  assignedTo: { id: number; name: string } | null;
};

export async function getAllSupportRequests(): Promise<SupportRequestWithUser[]> {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) return [];
  try {
    return await db.query.supportRequests.findMany({
      orderBy: [desc(supportRequests.createdAt)],
      with: {
        user: { columns: { id: true, name: true, email: true, phone: true } },
        business: { columns: { id: true, businessName: true } },
        assignedTo: { columns: { id: true, name: true } },
      },
    });
  } catch (error) {
    console.error("getAllSupportRequests failed (run `npm run db:apply`?):", error);
    return [];
  }
}

export async function getTeamMembers(): Promise<{ id: number; name: string }[]> {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) return [];
  return db.query.users.findMany({
    where: and(inArray(users.role, ["admin", "internal"]), eq(users.status, "approved")),
    columns: { id: true, name: true },
    orderBy: [users.name],
  });
}

export async function updateSupportRequest(
  id: number,
  patch: { status?: SupportStatus; adminNotes?: string; assignedToId?: number | null },
): Promise<FormState> {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) return { message: "", error: "Unauthorized." };
  if (patch.status && !supportStatusEnum.enumValues.includes(patch.status)) return { message: "", error: "Invalid status." };
  try {
    await db
      .update(supportRequests)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(supportRequests.id, id));
    revalidatePath("/dashboard/admin/support");
    revalidatePath("/dashboard/support");
    return { message: "Saved.", error: "" };
  } catch (error) {
    console.error("updateSupportRequest failed:", error);
    return { message: "", error: "Failed to save." };
  }
}

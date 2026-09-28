"use server";

import { db } from "@/db";
import { users } from "@/db/schema"; // Import userStatus
import bcrypt from "bcrypt";
import { FormState } from "@/types/form-state"; // Import FormState
import { sendEmail, accountRequestedEmail, appUrl } from "@/lib/email";
import { pitchCompetitionEvents } from "@/db/schema";
import { eq, or, and, inArray } from "drizzle-orm";

export async function createAccount(prevState: FormState, formData: FormData): Promise<FormState> {
  const name = ((formData.get("name") as string | null) ?? "").trim();
  const phone = ((formData.get("phone") as string | null) ?? "").trim();
  const email = ((formData.get("email") as string | null) ?? "").trim().toLowerCase();
  const password = formData.get("password") as string;
  const rawBusinessName = formData.get("businessName") as string | undefined; // Capture businessName
  const businessName = rawBusinessName?.trim() || undefined;
  const pitchChoice = ((formData.get("pitchEvent") as string | null) ?? "").trim();
  const pitchEventOther = ((formData.get("pitchEventOther") as string | null) ?? "").trim();
  const noPitchYet = pitchChoice === "none";
  const pitchEventId = Number(pitchChoice);
  const pitchEventIds = Number.isInteger(pitchEventId) && pitchEventId > 0 ? [pitchEventId] : [];

  // Basic validation
  if (!name || !phone || !email || !password) {
    return { message: "", error: "All fields are required.", businessName }; // Include businessName in error state
  }
  if (!pitchChoice) {
    return { message: "", error: "Please tell us which pitch competition you were in.", fieldErrors: { pitchEvents: "Choose one from the list." }, businessName };
  }
  if (pitchChoice === "other" && !pitchEventOther) {
    return { message: "", error: "Please tell us which pitch competition you were in.", fieldErrors: { pitchEventOther: "Enter the competition name." }, businessName };
  }
  if (pitchEventIds.length === 0 && !noPitchYet && pitchChoice !== "other") {
    return { message: "", error: "Please choose a pitch competition from the list.", fieldErrors: { pitchEvents: "Choose one from the list." }, businessName };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      phone,
      email,
      password: hashedPassword,
      status: 'pending', // Set status to pending
      businessName: businessName || null, // Save businessName to the database
      pitchEventIds: pitchEventIds.length > 0 ? pitchEventIds : null,
      pitchEventOther: pitchChoice === "other" ? pitchEventOther : noPitchYet ? "Has not pitched with HTH yet" : null,
    });

    // Confirmation email. Never fails the request if email is down or unconfigured.
    await sendEmail({ to: { email, name }, ...accountRequestedEmail(name) });

    // Tell the team: every admin, plus team members who can approve requests.
    try {
      const approvers = await db.query.users.findMany({
        where: and(
          eq(users.status, "approved"),
          or(eq(users.role, "admin"), and(eq(users.role, "internal"), eq(users.canApproveRequests, true))),
        ),
        columns: { email: true, name: true },
      });
      const events = pitchEventIds.length
        ? await db.query.pitchCompetitionEvents.findMany({ where: inArray(pitchCompetitionEvents.id, pitchEventIds), columns: { name: true } })
        : [];
      const pitchLabel = [...events.map((e) => e.name), pitchChoice === "other" ? pitchEventOther : noPitchYet ? "Has not pitched yet" : ""].filter(Boolean).join(", ") || "Not answered";
      const link = `${appUrl()}/dashboard/admin/users`;
      const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
      await Promise.all(
        approvers.map((a) =>
          sendEmail({
            to: { email: a.email, name: a.name },
            subject: `New account request: ${name}${businessName ? ` (${businessName})` : ""}`,
            text: `${name} requested a portal account.\n\nEmail: ${email}\nPhone: ${phone}\nBusiness: ${businessName ?? "—"}\nPitch competition: ${pitchLabel}\n\nApprove or reject: ${link}`,
            html: `<p><strong>${esc(name)}</strong> requested a portal account.</p><p><strong>Email:</strong> ${esc(email)}<br/><strong>Phone:</strong> ${esc(phone)}<br/><strong>Business:</strong> ${esc(businessName ?? "—")}<br/><strong>Pitch competition:</strong> ${esc(pitchLabel)}</p><p><a href="${link}" style="display:inline-block;background:#910000;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Review request</a></p><p style="color:#666;font-size:12px">${link}</p>`,
          }),
        ),
      );
    } catch (notifyError) {
      console.warn("Account request notification failed:", notifyError);
    }

    return { message: "Thank you for your request. We will get back to you shortly.", error: "", businessName }; // Include businessName in success state
  } catch (error) {
    console.error("Error creating account:", error);
    // Check for unique email constraint violation
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint "users_email_unique"')) {
      return { message: "", error: "An account with this email already exists.", businessName }; // Include businessName in error state
    }
    return { message: "", error: "Failed to submit account request.", businessName }; // Include businessName in error state
  }
}

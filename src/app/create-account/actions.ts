"use server";

import { db } from "@/db";
import { users } from "@/db/schema"; // Import userStatus
import bcrypt from "bcrypt";
import { FormState } from "@/types/form-state"; // Import FormState
import { sendEmail, accountRequestedEmail } from "@/lib/email";
import { notifyApprovers, notifyHtml, esc, appUrl } from "@/lib/notify";
import { pitchCompetitionEvents } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { clientIp, hit, retryMessage } from "@/lib/rate-limit";

/** Account requests allowed per IP per hour. Real signups are a handful a day. */
const SIGNUP_WINDOW_MS = 60 * 60 * 1000;
const SIGNUP_LIMIT_PER_IP = 5;

/**
 * The same answer whether or not the address already has an account, so this
 * form can't be used to check who is a member. A duplicate request is simply
 * not inserted; the real account holder is unaffected.
 */
const REQUEST_RECEIVED = "Thank you for your request. We will get back to you shortly.";

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

  const rate = hit(`signup:ip:${await clientIp()}`, SIGNUP_LIMIT_PER_IP, SIGNUP_WINDOW_MS);
  if (rate.limited) {
    return {
      message: "",
      error: `Too many account requests from this connection. Please try again in ${retryMessage(rate.retryAfterSeconds)}.`,
      businessName,
    };
  }

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
    const events = pitchEventIds.length
      ? await db.query.pitchCompetitionEvents.findMany({ where: inArray(pitchCompetitionEvents.id, pitchEventIds), columns: { name: true } })
      : [];
    const pitchLabel = [...events.map((e) => e.name), pitchChoice === "other" ? pitchEventOther : noPitchYet ? "Has not pitched yet" : ""].filter(Boolean).join(", ") || "Not answered";
    const link = { href: `${appUrl()}/dashboard/admin/users`, label: "Review request" };
    await notifyApprovers(
      `New account request: ${name}${businessName ? ` (${businessName})` : ""}`,
      `${name} requested a portal account.\n\nEmail: ${email}\nPhone: ${phone}\nBusiness: ${businessName ?? "—"}\nPitch competition: ${pitchLabel}\n\nApprove or reject: ${link.href}`,
      notifyHtml(`${esc(name)} requested an account`, `<p><strong>Email:</strong> ${esc(email)}<br/><strong>Phone:</strong> ${esc(phone)}<br/><strong>Business:</strong> ${esc(businessName ?? "—")}<br/><strong>Pitch competition:</strong> ${esc(pitchLabel)}</p>`, link),
    );

    return { message: REQUEST_RECEIVED, error: "", businessName };
  } catch (error) {
    // An address that already has an account gets the same reply as a new one.
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint "users_email_unique"')) {
      console.warn("Account request for an address that already exists; answered generically.");
      return { message: REQUEST_RECEIVED, error: "", businessName };
    }
    console.error("Error creating account:", error);
    return { message: "", error: "Failed to submit account request.", businessName }; // Include businessName in error state
  }
}

"use server";

import { db } from "@/db";
import { users } from "@/db/schema"; // Import userStatus
import bcrypt from "bcrypt";
import { FormState } from "@/types/form-state"; // Import FormState
import { sendEmail, accountRequestedEmail } from "@/lib/email";

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

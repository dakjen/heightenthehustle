"use server";

import { db } from "@/db";
import { users, userStatus } from "@/db/schema"; // Import userStatus
import bcrypt from "bcrypt";
import { FormState } from "@/types/form-state"; // Import FormState

export async function createAccount(prevState: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!name || !phone || !email || !password) {
    return { message: "", error: "All fields are required." };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      phone,
      email,
      password: hashedPassword,
      status: 'pending', // Set status to pending
    });

    return { message: "Thank you for your request. We will get back to you shortly.", error: "" };
  } catch (error) {
    console.error("Error creating account:", error);
    // Check for unique email constraint violation
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint "users_email_unique"')) {
      return { message: "", error: "An account with this email already exists." };
    }
    return { message: "", error: "Failed to submit account request." };
  }
}

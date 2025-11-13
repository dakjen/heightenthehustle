"use server";

import { db } from "@/db";
import { users, userStatus } from "@/db/schema"; // Import userStatus
import bcrypt from "bcrypt";

export async function createAccount(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    phone,
    email,
    password: hashedPassword,
    status: 'pending', // Set status to pending
  });

  // In a real app, you'd want to redirect the user to the login page
  // or directly log them in.
  console.log("Account created successfully!");
}

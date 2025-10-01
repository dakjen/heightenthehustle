"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing

type FormState = {
  message: string;
  error: string;
} | undefined;

export async function createUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as 'admin' | 'internal' | 'external';

  if (!name || !email || !phone || !password || !role) {
    return { message: "", error: "All fields are required." };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    await db.insert(users).values({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    revalidatePath("/dashboard/admin/users");
    return { message: "User created successfully!", error: "" };
  } catch (error) {
    console.error("Error creating user:", error);
    // Check for unique constraint violation (e.g., duplicate email)
    if (error instanceof Error && error.message.includes("duplicate key value violates unique constraint")) {
      return { message: "", error: "User with this email already exists." };
    }
    return { message: "", error: "Failed to create user." };
  }
}

export async function updateUser(userId: number, formData: FormData) {
  // Placeholder for update logic
  console.log(`Updating user ${userId} with data:`, formData);
  // In a real implementation, you would extract data from formData and update the database
  revalidatePath("/dashboard/admin/users");
  return { message: "User update functionality not yet implemented." };
}

export async function deleteUser(userId: number) {
  // Placeholder for delete logic
  console.log(`Deleting user ${userId}`);
  // In a real implementation, you would delete the user from the database
  revalidatePath("/dashboard/admin/users");
  return { message: "User delete functionality not yet implemented." };
}

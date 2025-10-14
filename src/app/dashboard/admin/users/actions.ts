"use server";

import { db } from "@/db";
import { users, userRole } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/login/actions";
import { revalidatePath } from "next/cache";
import bcrypt from 'bcrypt';
import { getAllBusinesses } from "../businesses/actions"; // Added import

type FormState = {
  message: string;
  error: string;
} | undefined;

export async function getAllUsers() {
  try {
    const allUsers = await db.query.users.findMany();
    return allUsers;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function createUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    return { message: "", error: "Unauthorized." };
  }

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
      password: hashedPassword, // Store the hashed password
      role,
    });
    revalidatePath("/dashboard/admin/users");
    return { message: "User created successfully!", error: "" };
  } catch (error) {
    console.error("Error creating user:", error);
    return { message: "", error: "Failed to create user." };
  }
}

export async function updateUserPermissions(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    return { message: "", error: "Unauthorized." };
  }

  const userId = parseInt(formData.get("userId") as string);
  const canMessageAdmins = formData.get("canMessageAdmins") === "on"; // Checkbox value

  if (isNaN(userId)) {
    return { message: "", error: "Invalid user ID." };
  }

  try {
    // In a real application, you would update the user's permissions in the database.
    // For now, we'll just log it.
    console.log(`Updating permissions for user ${userId}: canMessageAdmins = ${canMessageAdmins}`);

    // Example: Update a 'permissions' JSONB column or a separate permissions table
    // await db.update(users).set({
    //   permissions: { canMessageAdmins }
    // }).where(eq(users.id, userId));

    revalidatePath("/dashboard/admin/users");
    return { message: "Permissions updated successfully!", error: "" };
  }
  catch (error) {
    console.error("Error updating user permissions:", error);
    return { message: "", error: "Failed to update permissions." };
  }
}

export async function updateUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    return { message: "", error: "Unauthorized." };
  }

  const userId = parseInt(formData.get("userId") as string);
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as typeof userRole.enumValues[number];

  if (isNaN(userId) || !email || !phone || !role) {
    return { message: "", error: "All fields are required." };
  }

  try {
    await db.update(users)
      .set({ email, phone, role })
      .where(eq(users.id, userId));
    revalidatePath("/dashboard/admin/users");
    return { message: "User updated successfully!", error: "" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { message: "", error: "Failed to update user." };
  }
}

export async function downloadAllData() {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    throw new Error("Unauthorized");
  }

  const usersData = await getAllUsers();
  const businessesData = await getAllBusinesses("", {});

  // Remove sensitive information from users
  const sanitizedUsers = usersData.map(({ password, ...user }) => user);

  const allData = {
    users: sanitizedUsers,
    businesses: businessesData,
  };

  return allData;
}
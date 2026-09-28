"use server";

import { FormState } from "@/types/form-state";
import { db } from "@/db";
import { users, userRole } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/login/actions";
import { createSession } from "@/lib/session";
import { hasPermission, requireAdmin } from "@/lib/auth";
import { safeUserColumns, type SafeUser } from "@/lib/users";
import { revalidatePath } from "next/cache";
import bcrypt from 'bcrypt';
import { getAllBusinesses } from "../businesses/actions"; // Added import
import { sendEmail, accountApprovedEmail, appUrl } from "@/lib/email";

// Define a type for a single user with status (never carries the password hash)
type UserWithStatus = SafeUser;

/** Every user, for the admin user-management screens. Admins only. */
export async function getAllUsers(): Promise<UserWithStatus[]> {
  await requireAdmin();
  try {
    return await db.query.users.findMany({ columns: safeUserColumns });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function getAllPendingUserRequests(): Promise<UserWithStatus[]> {
  const session = await getSession();
  if (!session?.user || !hasPermission(session.user, 'canApproveRequests')) {
    return []; // Unauthorized
  }

  try {
    return await db.query.users.findMany({
      where: eq(users.status, 'pending'),
      columns: safeUserColumns,
    });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    return [];
  }
}

export async function approveUser(userId: number): Promise<FormState> {
  const session = await getSession();
  if (!session || !session.user) {
    return { message: "", error: "Unauthorized." };
  }

  // Admins can always approve. Internal users need specific permission.
  if (!hasPermission(session.user, 'canApproveRequests')) {
    return { message: "", error: "Unauthorized to approve users." };
  }

  try {
    await db.update(users)
      .set({ status: 'approved' })
      .where(eq(users.id, userId));

    // Welcome email pointing at the intake form. Email failure never fails the approval.
    const approved = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { name: true, email: true },
    });
    if (approved) {
      const link = `${appUrl()}/login?next=${encodeURIComponent("/dashboard/intake-form")}`;
      const result = await sendEmail({
        to: { email: approved.email, name: approved.name },
        ...accountApprovedEmail(approved.name, link),
      });
      if (!result.sent) {
        console.warn(`Approval email not sent to ${approved.email} (${result.reason ?? "unknown"}).`);
      }
    }

    revalidatePath("/dashboard/admin/users");
    return { message: "User approved successfully!", error: "" };
  } catch (error) {
    console.error("Error approving user:", error);
    return { message: "", error: "Failed to approve user." };
  }
}

export async function rejectUser(userId: number): Promise<FormState> {
  const session = await getSession();
  if (!session || !session.user) {
    return { message: "", error: "Unauthorized." };
  }

  // Admins can always reject. Internal users need specific permission.
  if (!hasPermission(session.user, 'canApproveRequests')) {
    return { message: "", error: "Unauthorized to reject users." };
  }

  try {
    // Instead of setting status to 'rejected', delete the user
    const deleteResult = await deleteUser(userId);
    if (deleteResult.error) {
      return { message: "", error: `Failed to reject and delete user: ${deleteResult.error}` };
    }
    revalidatePath("/dashboard/admin/users");
    return { message: "User rejected and deleted successfully!", error: "" };
  } catch (error) {
    console.error("Error rejecting user:", error);
    return { message: "", error: "Failed to reject user." };
  }
}

export async function deleteUser(userId: number): Promise<FormState> {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    return { message: "", error: "Unauthorized." };
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/dashboard/admin/users");
    return { message: "User deleted successfully!", error: "" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { message: "", error: "Failed to delete user." };
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
      status: 'approved', // Admins create approved users
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
  const canApproveRequests = formData.get("canApproveRequests") === "on"; // New checkbox value
  const canManageClasses = formData.get("canManageClasses") === "on"; // New checkbox value
  const canManageBusinesses = formData.get("canManageBusinesses") === "on"; // New checkbox value

  if (isNaN(userId)) {
    return { message: "", error: "Invalid user ID." };
  }

  try {
    await db.update(users).set({
      canMessageAdmins: canMessageAdmins,
      canApproveRequests: canApproveRequests,
      canManageClasses: canManageClasses,
      canManageBusinesses: canManageBusinesses,
    }).where(eq(users.id, userId));

    // If the updated user is the currently logged-in user, refresh their session
    // so the new permissions take effect without a sign-out.
    if (session.user.id === userId) {
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: safeUserColumns,
      });
      if (updatedUser) await createSession(updatedUser);
    }

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
  const sanitizedUsers = usersData.map((user) => {
    const sanitized = { ...user };
    delete (sanitized as { password?: unknown }).password;
    return sanitized;
  });

  const allData = {
    users: sanitizedUsers,
    businesses: businessesData,
  };

  return allData;
}
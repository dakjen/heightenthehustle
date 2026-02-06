"use server";

import { FormState } from "@/types/form-state";
import { db } from "@/db";
import { users, userRole } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/login/actions";
import { revalidatePath } from "next/cache";
import bcrypt from 'bcrypt';
import { getAllBusinesses } from "../businesses/actions"; // Added import

// Define a type for a single user with status
type UserWithStatus = typeof users.$inferSelect;

export async function getAllUsers(): Promise<UserWithStatus[]> {
  try {
    const allUsers = await db.query.users.findMany();
    return allUsers;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function getAllPendingUserRequests(): Promise<UserWithStatus[]> {
  const session = await getSession();
  if (!session || !session.user || (session.user.role !== 'admin' && (session.user.role !== 'internal' || !session.user.canApproveRequests))) {
    return []; // Unauthorized
  }

  try {
    const pendingUsers = await db.query.users.findMany({
      where: eq(users.status, 'pending'),
      columns: {
        id: true,
        name: true,
        phone: true,
        email: true,
        password: true,
        role: true,
        status: true,
        hasBusinessProfile: true,
        personalAddress: true,
        personalCity: true,
        personalState: true,
        personalZipCode: true,
        profilePhotoUrl: true,
        isOptedOut: true,
        businessName: true, // Explicitly select businessName
        canApproveRequests: true, // Explicitly select canApproveRequests
        canMessageAdmins: true, // Explicitly select canMessageAdmins
        canManageClasses: true, // Explicitly select canManageClasses
        canManageBusinesses: true,
        isCisgender: true,
        isTransgender: true,
      }
    });
    return pendingUsers;
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
  if (session.user.role !== 'admin' && (session.user.role !== 'internal' || !session.user.canApproveRequests)) {
    return { message: "", error: "Unauthorized to approve users." };
  }

  try {
    await db.update(users)
      .set({ status: 'approved' })
      .where(eq(users.id, userId));
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
  if (session.user.role !== 'admin' && (session.user.role !== 'internal' || !session.user.canApproveRequests)) {
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

    // If the updated user is the currently logged-in user, update their session
    if (session.user.id === userId) {
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (updatedUser) {
        const { encrypt } = await import("@/app/login/actions"); // Dynamically import encrypt
        const { cookies } = await import("next/headers"); // Dynamically import cookies
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        const cookieStore = await cookies(); // Await the cookies() call
        cookieStore.set("session", await encrypt({ user: updatedUser, expires }), { expires, httpOnly: true });
      }
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
  const sanitizedUsers = usersData.map(({ password: _, ...user }) => user);

  const allData = {
    users: sanitizedUsers,
    businesses: businessesData,
  };

  return allData;
}
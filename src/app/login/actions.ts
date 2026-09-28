"use server";

import { FormState } from "@/types/form-state";
import { db } from "@/db";
import { users, clientIntakeForms } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import {
  createSession,
  clearSession,
  getSession as readSession,
  type SessionPayload,
  type UserSession,
} from "@/lib/session";
import { clientIp, hit, reset, retryMessage } from "@/lib/rate-limit";

export type { SessionPayload, UserSession };

/**
 * Sign-in attempts allowed per 15 minutes. Counted per email address and per
 * IP, so neither "one password against many accounts" nor "many passwords
 * against one account" gets a free run. Each attempt also costs a bcrypt
 * comparison, so the IP limit doubles as CPU protection.
 */
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT_PER_EMAIL = 5;
const LOGIN_LIMIT_PER_IP = 20;

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
  const email = ((formData.get("email") as string | null) ?? "").trim();
  const password = formData.get("password") as string;
  const next = formData.get("next");
  if (!email || !password) {
    return { message: "", error: "Enter your email and password." };
  }

  const ip = await clientIp();
  const emailKey = `login:email:${email.toLowerCase()}`;
  const ipKey = `login:ip:${ip}`;
  const byIp = hit(ipKey, LOGIN_LIMIT_PER_IP, LOGIN_WINDOW_MS);
  const byEmail = hit(emailKey, LOGIN_LIMIT_PER_EMAIL, LOGIN_WINDOW_MS);
  if (byIp.limited || byEmail.limited) {
    const wait = retryMessage(Math.max(byIp.retryAfterSeconds, byEmail.retryAfterSeconds));
    return { message: "", error: `Too many sign-in attempts. Please try again in ${wait}.` };
  }

  // Case-insensitive match so Jane@Example.com and jane@example.com both work.
  const user = await db.query.users.findFirst({
    where: sql`lower(${users.email}) = ${email.toLowerCase()}`,
    columns: {
      id: true,
      name: true,
      email: true,
      phone: true,
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
      canApproveRequests: true,
      canMessageAdmins: true,
      canManageClasses: true,
      canManageBusinesses: true,
      isTransgender: true,
    },
  });

  if (!user) {
    return { message: "", error: "Invalid email or password" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { message: "", error: "Invalid email or password" };
  }

  if (user.status !== 'approved') {
    return { message: "", error: "We'll verify your request and send you an approval" };
  }

  // Where to land after sign-in: an explicit safe in-app `next`, else the
  // intake form for users who have not submitted one yet, else the dashboard.
  let target = "/dashboard";
  const safeNext = typeof next === "string" && (next === "/dashboard" || next.startsWith("/dashboard/")) && !next.includes("//") && !next.includes("\\");
  if (safeNext) {
    target = next;
  } else if (user.role === "external") {
    // Members land on the intake form until they've submitted one. Admins and team go straight home.
    try {
      const intake = await db.query.clientIntakeForms.findFirst({
        where: eq(clientIntakeForms.userId, user.id),
        columns: { id: true },
      });
      if (!intake) target = "/dashboard/intake-form";
    } catch (error) {
      // If the intake table is missing or the query fails, still let them in.
      console.error("Intake lookup during login failed:", error);
    }
  }

  try {
    // createSession keeps only the session fields; the password hash never travels.
    await createSession(user);
  } catch (error) {
    console.error("Login error:", error);
    return { message: "", error: "An unexpected error occurred during login." };
  }

  // Signed in successfully: don't hold earlier typos against them.
  reset(emailKey);
  reset(ipKey);

  redirect(target);
}

export async function logout() {
  await clearSession();
  redirect("/login");
}

export async function getSession(): Promise<SessionPayload | null> {
  return await readSession();
}

// Server action so client components can read the session.
export async function fetchSession(): Promise<SessionPayload | null> {
  return await readSession();
}

"use server";

import { FormState } from "@/types/form-state";
import { db } from "@/db";
import { users, clientIntakeForms } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Shape of the user object stored in the session cookie. Never includes the password hash.
interface UserSession {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'internal' | 'external';
  status: 'pending' | 'approved' | 'rejected';
  hasBusinessProfile: boolean;
  personalAddress: string | null;
  personalCity: string | null;
  personalState: string | null;
  personalZipCode: string | null;
  profilePhotoUrl: string | null;
  isOptedOut: boolean;
  isTransgender: boolean;
  canApproveRequests: boolean;
  canMessageAdmins: boolean;
  canManageClasses: boolean;
  canManageBusinesses: boolean;
}

export interface SessionPayload extends JWTPayload {
  user?: UserSession;
  expires?: Date;
}

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is not set.");
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] });
    return payload as SessionPayload;
  } catch {
    // Expired or tampered token: treat as signed out rather than crashing the page.
    return null;
  }
}

async function createSession(user: UserSession) {
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const cookieStore = await cookies();
  cookieStore.set("session", await encrypt({ user, expires }), {
    expires,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = formData.get("next");

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
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

  // Drop the password hash before anything goes into the cookie.
  const { password: _passwordHash, ...sessionUser } = user;

  // Where to land after sign-in: an explicit safe in-app `next`, else the
  // intake form for users who have not submitted one yet, else the dashboard.
  let target = "/dashboard";
  const safeNext = typeof next === "string" && (next === "/dashboard" || next.startsWith("/dashboard/")) && !next.includes("//") && !next.includes("\\");
  if (safeNext) {
    target = next;
  } else if (user.role === "external") {
    // Members land on the intake form until they've submitted one. Admins and team go straight home.
    const intake = await db.query.clientIntakeForms.findFirst({
      where: eq(clientIntakeForms.userId, user.id),
      columns: { id: true },
    });
    if (!intake) target = "/dashboard/intake-form";
  }

  try {
    await createSession(sessionUser);
  } catch (error) {
    console.error("Login error:", error);
    return { message: "", error: "An unexpected error occurred during login." };
  }

  redirect(target);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0), path: "/" });
  redirect("/login");
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

// Server action so client components can read the session.
export async function fetchSession(): Promise<SessionPayload | null> {
  return await getSession();
}

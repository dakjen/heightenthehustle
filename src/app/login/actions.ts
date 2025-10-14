"use server";

import { db } from "@/db";
import { users, businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Define the structure of the user object within the session
interface UserSession {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'internal' | 'external'; // Assuming userRole enum from schema
  hasBusinessProfile: boolean;
  personalAddress: string | null;
  personalCity: string | null;
  personalState: string | null;
  personalZipCode: string | null;
  profilePhotoUrl: string | null;
  isOptedOut: boolean;
}

// Extend JWTPayload to include our user session data
export interface SessionPayload extends JWTPayload {
  user?: UserSession;
  expires?: Date;
}

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is not set.");
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as SessionPayload;
}

export type FormState = {
  error: string;
} | undefined;

export async function login(prevState: FormState, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return { error: "Invalid email or password" };
  }

  try {
    // Create session
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const cookieStore = await cookies();
    cookieStore.set("session", await encrypt({ user, expires }), { expires, httpOnly: true });

    // Check if user has any active businesses
    const userBusinesses = await db.query.businesses.findFirst({
      where: eq(businesses.userId, user.id),
    });

    if (!userBusinesses) {
      redirect("/dashboard"); // Redirect to dashboard (home page) if no businesses exist
    } else {
      redirect("/dashboard"); // Redirect to dashboard if businesses exist
    }
  } catch (error) {
    // Re-throw NEXT_REDIRECT errors to allow Next.js to handle the redirect
    if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Login error:", error); // Log other errors for server-side debugging
    return { error: "An unexpected error occurred during login." };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) });
  redirect("/login");
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

// New server action to fetch session for client components
export async function fetchSession(): Promise<SessionPayload | null> {
  return await getSession();
}

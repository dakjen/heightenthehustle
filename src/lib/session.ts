/**
 * The one place the session cookie is created, read and cleared.
 *
 * Everything about a session lives here so the rules can't drift: what goes
 * into the token (never the password hash), how long it lasts, and which
 * cookie flags it carries. Call `createSession()` whenever the signed-in
 * user's details change — never write the `session` cookie by hand.
 *
 * This is a plain module, not a `"use server"` file, on purpose: `encrypt()`
 * mints a valid session token, so it must never be reachable as a server
 * action.
 */
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/** Shape of the user object stored in the session cookie. Never includes the password hash. */
export interface UserSession {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "internal" | "external";
  status: "pending" | "approved" | "rejected";
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

const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is not set.");
}
const key = new TextEncoder().encode(secretKey);

/**
 * Narrow any user row down to the fields the session may carry.
 *
 * Callers pass whole database rows; this picks field by field, so a column
 * added to `users` later (a password hash, a token, a note) can never leak
 * into the cookie by accident.
 */
export function toSessionUser(user: UserSession): UserSession {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    hasBusinessProfile: user.hasBusinessProfile,
    personalAddress: user.personalAddress,
    personalCity: user.personalCity,
    personalState: user.personalState,
    personalZipCode: user.personalZipCode,
    profilePhotoUrl: user.profilePhotoUrl,
    isOptedOut: user.isOptedOut,
    isTransgender: user.isTransgender,
    canApproveRequests: user.canApproveRequests,
    canMessageAdmins: user.canMessageAdmins,
    canManageClasses: user.canManageClasses,
    canManageBusinesses: user.canManageBusinesses,
  };
}

async function encrypt(payload: SessionPayload, expires: Date): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
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

/**
 * Issue a session cookie for `user`. Use this after sign-in and after any
 * change to the signed-in user's own profile or permissions, so the cookie
 * and the token always expire together and always carry the same flags.
 */
export async function createSession(user: UserSession): Promise<void> {
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await encrypt({ user: toSessionUser(user), expires }, expires);
  (await cookies()).set(SESSION_COOKIE, token, {
    expires,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

/** The signed-in user's session, or null when signed out, expired or tampered with. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await decrypt(token);
}

export async function clearSession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { expires: new Date(0), path: "/" });
}

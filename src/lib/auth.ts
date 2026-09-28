import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { getSession, type UserSession } from "@/lib/session";

type SessionUser = UserSession;
export type Permission = "canApproveRequests" | "canManageClasses" | "canManageBusinesses";

/** Returns the signed-in user or redirects to /login. Use in pages/layouts. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** True for admins, or internal users holding the given permission. */
export function hasPermission(user: SessionUser, permission?: Permission): boolean {
  if (user.role === "admin") return true;
  if (user.role !== "internal") return false;
  return permission ? Boolean(user[permission]) : false;
}

/** True if the user may see the Admin section at all. */
export function canAccessAdminArea(user: SessionUser): boolean {
  return (
    user.role === "admin" ||
    (user.role === "internal" &&
      (user.canApproveRequests || user.canManageClasses || user.canManageBusinesses))
  );
}

/**
 * For server actions and route handlers: throws unless the caller is an admin
 * or an internal user with the given permission.
 */
export async function requirePermission(permission?: Permission): Promise<SessionUser> {
  const session = await getSession();
  if (!session?.user || !hasPermission(session.user, permission)) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

/** Staff = admin, or a team member holding at least one admin permission. */
export function isStaff(user: SessionUser): boolean {
  return canAccessAdminArea(user);
}

/** For server actions: throws unless the caller is staff (admin or a team member). */
export async function requireStaff(): Promise<SessionUser> {
  const session = await getSession();
  if (!session?.user || !isStaff(session.user)) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

/** For server actions that only admins may run. Throws for everyone else. */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

/**
 * For "show me user X's records" actions.
 *
 * Staff may ask about anybody; everyone else is silently scoped to
 * themselves, so a caller-supplied id can never be used to read someone
 * else's data. Returns null when signed out.
 */
export async function userScope(requestedUserId?: number): Promise<{ user: SessionUser; userId: number } | null> {
  const session = await getSession();
  if (!session?.user) return null;
  const user = session.user;
  const wanted = Number.isInteger(requestedUserId) ? (requestedUserId as number) : user.id;
  return { user, userId: isStaff(user) ? wanted : user.id };
}

/**
 * For server actions that touch a specific business: returns the signed-in user
 * if they own the business or are staff; otherwise null. Never throws.
 */
export async function businessAccess(businessId: number): Promise<{ user: SessionUser; isOwner: boolean } | null> {
  const session = await getSession();
  if (!session?.user || !Number.isInteger(businessId)) return null;
  const user = session.user;
  if (isStaff(user)) {
    const exists = await db.query.businesses.findFirst({ where: eq(businesses.id, businessId), columns: { id: true } });
    return exists ? { user, isOwner: false } : null;
  }
  const owned = await db.query.businesses.findFirst({
    where: and(eq(businesses.id, businessId), eq(businesses.userId, user.id)),
    columns: { id: true },
  });
  return owned ? { user, isOwner: true } : null;
}

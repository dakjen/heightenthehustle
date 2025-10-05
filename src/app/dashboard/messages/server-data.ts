import { db } from "@/db";
import { users, massMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/login/actions";

export async function getAllInternalUsers() {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    return [];
  }
  const internalUsers = await db.select().from(users).where(eq(users.role, 'internal'));
  return internalUsers;
}

export async function getMassMessages() {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    return [];
  }
  const messages = await db.select().from(massMessages).orderBy(massMessages.timestamp);
  return messages;
}

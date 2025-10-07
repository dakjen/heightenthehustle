"use server";

import { getSession } from "@/app/login/actions";
import { db } from "@/db";
import { users, massMessages, locations, demographics, businesses, individualMessages } from "@/db/schema";
import { eq, inArray, and, or } from "drizzle-orm";
import { revalidateMessagesPath } from "./revalidate";

async function getLocationIdsByNames(locationNames: string[]): Promise<number[]> {
  if (locationNames.length === 0) {
    return [];
  }
  const existingLocations = await db.select().from(locations).where(inArray(locations.name, locationNames));
  return existingLocations.map(loc => loc.id);
}

type FormState = {
  message: string;
  error: string;
} | undefined;

export async function sendMessage(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session || !session.user) {
    return { message: "", error: "User not authenticated." };
  }

  const messageContent = formData.get("messageContent") as string;
  const recipient = formData.get("recipient") as string;

  if (!messageContent || !recipient) {
    return { message: "", error: "Message content and recipient are required." };
  }

  let targetRecipientId: number | undefined;

  // Check if recipient is a user ID
  if (!isNaN(parseInt(recipient))) {
    const recipientUser = await db.select().from(users).where(eq(users.id, parseInt(recipient))).limit(1);
    if (recipientUser.length === 0) {
      return { message: "", error: "Recipient user not found." };
    }
    targetRecipientId = recipientUser[0].id;
  } else {
    // If recipient is not a user ID, assume it's an admin or internal user by email/role
    // For now, we'll just assume it's an admin if not a user ID
    const adminUser = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    if (adminUser.length > 0) {
      targetRecipientId = adminUser[0].id;
    }
  }

  if (!targetRecipientId) {
    return { message: "", error: "Recipient not found." };
  }

  try {
    await db.insert(individualMessages).values({
      senderId: session.user.id,
      recipientId: targetRecipientId,
      content: messageContent,
      timestamp: new Date(),
    });
    return { message: "Message sent successfully!", error: "" };
  } catch (error) {
    console.error("Error sending individual message:", error);
    return { message: "", error: "Failed to send message." };
  }
}

export async function getMassMessages() {
  try {
    const allMassMessages = await db.select().from(massMessages);
    return allMassMessages;
  } catch (error) {
    console.error("Error fetching mass messages:", error);
    return [];
  }
}

export async function getAllInternalUsers() {
  try {
    const allUsers = await db.select().from(users);
    return allUsers;
  } catch (error) {
    console.error("Error fetching all internal users:", error);
    return [];
  }
}

export async function sendMassMessage(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    return { message: "", error: "Unauthorized: Only admins can send mass messages." };
  }

  const massMessageContent = formData.get("massMessageContent") as string;
  const targetLocationIdsString = formData.get("targetLocationIds") as string;
  const targetDemographicIdsString = formData.get("targetDemographicIds") as string;

  if (!massMessageContent) {
    return { message: "", error: "Message content is required." };
  }

  let targetLocationIds: number[] = [];
  if (targetLocationIdsString) {
    targetLocationIds = JSON.parse(targetLocationIdsString);
  }

  let targetDemographicIds: number[] = [];
  if (targetDemographicIdsString) {
    targetDemographicIds = JSON.parse(targetDemographicIdsString);
  }

  try {
    // Save the mass message record
    await db.insert(massMessages).values({
      adminId: session.user.id,
      content: massMessageContent,
      targetLocationIds: targetLocationIds,
      targetDemographicIds: targetDemographicIds,
      timestamp: new Date(),
    });

    // Find target users based on locations and demographics
    const conditions = [];

    if (targetLocationIds.length > 0) {
      conditions.push(inArray(businesses.locationId, targetLocationIds));
    }
    if (targetDemographicIds.length > 0) {
      conditions.push(inArray(businesses.demographicId, targetDemographicIds));
    }

    let targetedUsers: { id: number }[] = [];

    if (conditions.length > 0) {
      targetedUsers = await db.select({ id: users.id })
        .from(users)
        .innerJoin(businesses, eq(users.id, businesses.userId))
        .where(and(...conditions));
    } else {
      // If no specific locations or demographics are selected, target all internal users
      targetedUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, 'internal'));
    }

    // Send individual messages to targeted users
    if (targetedUsers.length > 0) {
      const messagesToInsert = targetedUsers.map(user => ({
        senderId: session.user!.id,
        recipientId: user.id,
        content: massMessageContent,
        timestamp: new Date(),
      }));
      await db.insert(individualMessages).values(messagesToInsert);
    }

    await revalidateMessagesPath();
    return { message: `Mass message sent to ${targetedUsers.length} users!`, error: "" };
  } catch (error) {
    console.error("Error sending mass message:", error);
    return { message: "", error: "Failed to send mass message." };
  }
}

export async function getAvailableLocations() {
  try {
    const allLocations = await db.select().from(locations);
    return allLocations;
  } catch (error) {
    console.error("Error fetching available locations:", error);
    return [];
  }
}

export async function getAvailableDemographics() {
  try {
    const allDemographics = await db.select().from(demographics);
    return allDemographics;
  } catch (error) {
    console.error("Error fetching available demographics:", error);
    return [];
  }
}

export async function getIndividualMessages(currentUserId: number, otherUserId: number) {
  try {
    const messages = await db.query.individualMessages.findMany({
      where: or(
        and(eq(individualMessages.senderId, currentUserId), eq(individualMessages.recipientId, otherUserId)),
        and(eq(individualMessages.senderId, otherUserId), eq(individualMessages.recipientId, currentUserId))
      ),
      orderBy: asc(individualMessages.timestamp),
    });
    return messages;
  } catch (error) {
    console.error("Error fetching individual messages:", error);
    return [];
  }
}

export async function getPendingRequests() {
  try {
    const pendingRequests = await db.query.individualMessages.findMany({
      where: and(
        eq(individualMessages.read, false),
        // Assuming external users have role 'external' and internal users have role 'internal' or 'admin'
        // This would require joining with the users table to check roles
        // For now, we'll assume sender is external and recipient is internal/admin
        // A more robust solution would involve fetching sender/recipient roles
      ),
      with: {
        sender: { columns: { name: true, email: true } },
        recipient: { columns: { name: true, email: true } },
      },
      orderBy: asc(individualMessages.timestamp),
    });
    return pendingRequests;
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }
}

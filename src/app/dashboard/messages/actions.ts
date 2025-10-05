"use server";

import { getSession } from "@/app/login/actions";
import { db } from "@/db";
import { users, massMessages, locations, demographics } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
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

  let targetRecipient: string = recipient;

  // Check if recipient is a user ID
  if (!isNaN(parseInt(recipient))) {
    const recipientUser = await db.select().from(users).where(eq(users.id, parseInt(recipient))).limit(1);
    if (recipientUser.length === 0) {
      return { message: "", error: "Recipient user not found." };
    }
    targetRecipient = recipientUser[0].email; // Or some other identifier
  }

  console.log(`User ${session.user.id} (${session.user.email}) sent a message to ${targetRecipient}: ${messageContent}`);

  // In a real application, you would save this message to a database
  // and handle permissions for recipients.

  return { message: "Message sent successfully!", error: "" };
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
  const massMessageLocations = formData.get("massMessageLocations") as string;

  if (!massMessageContent || !massMessageLocations) {
    return { message: "", error: "Message content and target locations are required." };
  }

  const locationsArray = massMessageLocations.split(', ').map(loc => loc.trim());
  const targetLocationIds = await getLocationIdsByNames(locationsArray);

  try {
    await db.insert(massMessages).values({
      adminId: session.user.id,
      content: massMessageContent,
      targetLocationIds: targetLocationIds,
      targetDemographicIds: [], // Placeholder for now
      timestamp: new Date(),
    });

    await revalidateMessagesPath();
    return { message: `Mass message sent to users in ${locationsArray.join(', ')}!`, error: "" };
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

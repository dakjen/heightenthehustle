"use server";

import { FormState } from "@/types/form-state";
import { getSession } from "@/app/login/actions";
import { db } from "@/db";
import { users, massMessages, locations, demographics, businesses, individualMessages } from "@/db/schema";
import { eq, inArray, and, or, asc, arrayOverlaps, count } from "drizzle-orm";
import { revalidateMessagesPath } from "./revalidate";
import { sendEmail, newMessageEmail, appUrl } from "@/lib/email";

/** Link every message-notification email points at. */
function messagesLink() {
  return `${appUrl()}/dashboard/messages`;
}

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

  let targetRecipient: { id: number; name: string; email: string } | undefined;

  // Check if recipient is a user ID
  if (!isNaN(parseInt(recipient))) {
    const recipientUser = await db.select().from(users).where(eq(users.id, parseInt(recipient))).limit(1);
    if (recipientUser.length === 0) {
      return { message: "", error: "Recipient user not found." };
    }
    targetRecipient = recipientUser[0];
  } else {
    // If recipient is not a user ID, assume it's an admin or internal user by email/role
    // For now, we'll just assume it's an admin if not a user ID
    const adminUser = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    if (adminUser.length > 0) {
      targetRecipient = adminUser[0];
    }
  }

  if (!targetRecipient) {
    return { message: "", error: "Recipient not found." };
  }

  try {
    await db.insert(individualMessages).values({
      senderId: session.user.id,
      recipientId: targetRecipient.id,
      content: messageContent,
      timestamp: new Date(),
    });

    // Notify the recipient by email. Direct messages are sent even when the
    // recipient has isOptedOut = true: opt-out covers marketing / mass
    // messages, not one-to-one replies in an ongoing support conversation.
    // sendEmail never throws, but guard anyway so the send never fails on email.
    try {
      const senderName = session.user.name || session.user.email || "the HTH team";
      await sendEmail({
        to: { email: targetRecipient.email, name: targetRecipient.name },
        ...newMessageEmail(targetRecipient.name, senderName, messageContent, messagesLink()),
      });
    } catch (error) {
      console.warn("New message email failed:", error);
    }

    await revalidateMessagesPath();
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
  const targetLocationIds = formData.getAll("locations").map(id => parseInt(id as string));
  const targetDemographicIds = formData.getAll("demographics").map(id => parseInt(id as string));
  const excludeOptedOut = formData.get("excludeOptedOut") === "on";

  if (!massMessageContent) {
    return { message: "", error: "Message content is required." };
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
    const userConditions = [];

    if (targetLocationIds.length > 0) {
      conditions.push(inArray(businesses.locationId, targetLocationIds));
    }
    if (targetDemographicIds.length > 0) {
      conditions.push(arrayOverlaps(businesses.demographicIds, targetDemographicIds));
    }

    if (excludeOptedOut) {
      userConditions.push(eq(users.isOptedOut, false));
    }

    let targetedUsers: { id: number; name: string; email: string; isOptedOut: boolean }[] = [];
    const targetColumns = { id: users.id, name: users.name, email: users.email, isOptedOut: users.isOptedOut };

    if (conditions.length > 0) {
      targetedUsers = await db.selectDistinct(targetColumns) // Use distinct to avoid duplicate users
        .from(users)
        .innerJoin(businesses, eq(users.id, businesses.userId))
        .where(and(...conditions, ...userConditions));
    } else {
      // If no specific locations or demographics are selected, target all users that match the userConditions
      userConditions.push(eq(users.role, 'internal')); // Original logic was to target internal users
      targetedUsers = await db.select(targetColumns).from(users).where(and(...userConditions));
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

      // Email each targeted recipient. Mass messages respect opt-out
      // regardless of the "exclude opted out" checkbox (which only controls
      // who gets the in-portal message). Email failures never fail the send.
      try {
        const senderName = session.user.name || session.user.email || "the HTH team";
        const link = messagesLink();
        await Promise.all(
          targetedUsers
            .filter((user) => !user.isOptedOut && user.email)
            .map((user) =>
              sendEmail({
                to: { email: user.email, name: user.name },
                ...newMessageEmail(user.name, senderName, massMessageContent, link),
              }),
            ),
        );
      } catch (error) {
        console.warn("Mass message email failed:", error);
      }
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
    console.log("Fetched Demographics:", allDemographics);
    return allDemographics;
  } catch (error) {
    console.error("Error fetching available demographics:", error);
    return [];
  }
}

export async function getIndividualMessages(currentUserId: number) {
  try {
    const messages = await db.query.individualMessages.findMany({
      where: or(
        eq(individualMessages.senderId, currentUserId),
        eq(individualMessages.recipientId, currentUserId)
      ),
      orderBy: asc(individualMessages.timestamp),
      with: {
        sender: { columns: { id: true, name: true, email: true } },
        recipient: { columns: { id: true, name: true, email: true } },
      },
    });
    return messages;
  } catch (error) {
    console.error("Error fetching individual messages:", error);
    return [];
  }
}

export async function getConversations(currentUserId: number, teamChat: boolean = false) {
  try {
    const messages = await db.query.individualMessages.findMany({
      where: or(
        eq(individualMessages.senderId, currentUserId),
        eq(individualMessages.recipientId, currentUserId)
      ),
      with: {
        sender: { columns: { id: true, name: true, email: true, role: true } },
        recipient: { columns: { id: true, name: true, email: true, role: true } },
      },
    });

    const conversations = messages.reduce((acc, msg) => {
      const otherUser = msg.senderId === currentUserId ? msg.recipient : msg.sender;
      if (!acc.find(c => c.id === otherUser.id)) {
        if (teamChat) {
          if (otherUser.role === 'admin' || otherUser.role === 'internal') {
            acc.push(otherUser);
          }
        } else {
          acc.push(otherUser);
        }
      }
      return acc;
    }, [] as { id: number; name: string; email: string, role: 'admin' | 'internal' | 'external' }[]);

    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}



/** Number of unread messages addressed to the signed-in user. 0 when signed out or on error. */
export async function getUnreadCount(): Promise<number> {
  const session = await getSession();
  if (!session || !session.user) return 0;
  try {
    const [row] = await db
      .select({ value: count() })
      .from(individualMessages)
      .where(and(eq(individualMessages.recipientId, session.user.id), eq(individualMessages.read, false)));
    return row?.value ?? 0;
  } catch (error) {
    console.error("Error counting unread messages:", error);
    return 0;
  }
}

/** Mark every message from `otherUserId` to the signed-in user as read. */
export async function markConversationRead(otherUserId: number): Promise<void> {
  const session = await getSession();
  if (!session || !session.user) return;
  try {
    await db
      .update(individualMessages)
      .set({ read: true })
      .where(
        and(
          eq(individualMessages.senderId, otherUserId),
          eq(individualMessages.recipientId, session.user.id),
          eq(individualMessages.read, false),
        ),
      );
    // Refresh the sidebar badge (dashboard layout) on the next navigation.
    await revalidateMessagesPath();
  } catch (error) {
    console.error("Error marking conversation read:", error);
  }
}

export async function getUserById(userId: number) {
  try {
    const result = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

export async function getApplicableBusinesses(locationIds: number[], demographicIds: number[]): Promise<{ id: number; businessName: string; ownerName: string }[]> {
  const conditions = [];
  if (locationIds.length > 0) {
    conditions.push(inArray(businesses.locationId, locationIds));
  }
  if (demographicIds.length > 0) {
    conditions.push(arrayOverlaps(businesses.demographicIds, demographicIds));
  }

  if (conditions.length === 0) {
    return [];
  }

  try {
    const result = await db.select({
      id: businesses.id,
      businessName: businesses.businessName,
      ownerName: businesses.ownerName,
    })
      .from(businesses)
      .innerJoin(users, eq(users.id, businesses.userId))
      .where(and(...conditions));
    return result;
  } catch (error) {
    console.error("Error fetching applicable businesses:", error);
    return [];
  }
}


"use server";

import { getSession } from "@/app/login/actions";

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
  const recipient = formData.get("recipient") as string; // 'admin' or 'internal'

  if (!messageContent || !recipient) {
    return { message: "", error: "Message content and recipient are required." };
  }

  console.log(`User ${session.user.id} (${session.user.email}) sent a message to ${recipient}: ${messageContent}`);

  // In a real application, you would save this message to a database
  // and handle permissions for recipients.

  return { message: "Message sent successfully!", error: "" };
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

  console.log(`Admin ${session.user.id} (${session.user.email}) sending mass message to locations: ${locationsArray.join(', ')} with content: ${massMessageContent}`);

  // In a real application, you would query your database for users in these locations
  // and then send them the message. For now, this is a placeholder.

  return { message: `Mass message sent to users in ${locationsArray.join(', ')}!`, error: "" };
}

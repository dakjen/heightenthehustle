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

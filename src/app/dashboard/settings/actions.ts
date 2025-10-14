"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/login/actions";
import { revalidatePath } from "next/cache";

type FormState = {
  message: string;
  error: string;
} | undefined;

export async function optOutUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session || !session.user) {
    return { message: "", error: "Unauthorized." };
  }

  const enteredName = formData.get("name") as string;

  if (enteredName !== session.user.name) {
    return { message: "", error: "Name does not match. Please try again." };
  }

  try {
    await db.update(users)
      .set({ isOptedOut: true })
      .where(eq(users.id, session.user.id));
    
    revalidatePath("/dashboard/settings");
    return { message: "You have successfully opted out of communications.", error: "" };
  } catch (error) {
    console.error("Error opting out user:", error);
    return { message: "", error: "Failed to update your preferences. Please try again." };
  }
}

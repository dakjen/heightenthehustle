"use server";

import { FormState } from "@/types/form-state";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/app/login/actions";
import { createSession } from "@/lib/session";
import { safeUserColumns } from "@/lib/users";
import { checkUpload, chosenFile, uploadPublicFile } from "@/lib/uploads";
import { revalidatePath } from "next/cache";

export async function updateProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();

  if (!session || !session.user || !session.user.id) {
    return { message: "", error: "User not authenticated." };
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const personalAddress = formData.get("personalAddress") as string;
  const personalCity = formData.get("personalCity") as string;
  const personalState = formData.get("personalState") as string;
  const personalZipCode = formData.get("personalZipCode") as string;
  const profilePhoto = chosenFile(formData.get("profilePhoto"));

  if (!name || !phone) {
    return { message: "", error: "Name and Phone are required." };
  }
  if (profilePhoto) {
    const problem = checkUpload(profilePhoto, "image");
    if (problem) return { message: "", error: problem, fieldErrors: { profilePhoto: problem } };
  }

  try {
    const profilePhotoUrl = profilePhoto
      ? await uploadPublicFile(profilePhoto, 'profile-photos', session.user.id)
      : undefined;

    await db.update(users)
      .set({
        name,
        phone,
        personalAddress,
        personalCity,
        personalState,
        personalZipCode,
        profilePhotoUrl: profilePhotoUrl || undefined,
      })
      .where(eq(users.id, session.user.id));

    // Refresh the session so the sidebar and profile show the new details.
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: safeUserColumns,
    });
    if (updatedUser) await createSession(updatedUser);

    revalidatePath("/dashboard"); // Revalidate the entire dashboard path to show updated data
    return { message: "Profile updated successfully!", error: "" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { message: "", error: "Failed to update profile." };
  }
}

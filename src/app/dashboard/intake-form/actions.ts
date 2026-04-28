'use server';

import { db } from "@/db";
import { clientIntakeForms, users, businessStageEnum, ClientIntakeForm, User } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession, SessionPayload } from "@/app/login/actions";
import { revalidatePath } from "next/cache";

import { FormState } from "@/types/form-state";

async function getUserIdFromSession(): Promise<number | undefined> {
  const session: SessionPayload | null = await getSession();
  return session?.user?.id;
}

export async function submitIntakeForm(prevState: FormState, formData: FormData): Promise<FormState> {
  const userId = await getUserIdFromSession();

  if (!userId) {
    return { message: "", error: "User not authenticated." };
  }

  const businessStage = formData.get("businessStage") as string;
  const businessDescription = formData.get("businessDescription") as string;
  const primaryGoals = formData.get("primaryGoals") as string;
  const biggestChallenges = formData.get("biggestChallenges") as string;
  const currentRevenue = formData.get("currentRevenue") as string;
  const numberOfEmployees = formData.get("numberOfEmployees") as string;
  const howDidYouHear = formData.get("howDidYouHear") as string;
  const additionalNotes = formData.get("additionalNotes") as string;

  // Collect selected services
  const servicesNeeded: string[] = [];
  const serviceOptions = ['Funding & Grants', 'Mentorship', 'Networking', 'Business Classes', 'Pitch Competition', 'Marketing Support', 'Legal Guidance', 'Other'];
  for (const service of serviceOptions) {
    if (formData.get(`service_${service}`) === 'on') {
      servicesNeeded.push(service);
    }
  }

  if (!businessStage || !businessDescription || !primaryGoals || !biggestChallenges) {
    return { message: "", error: "Please fill out all required fields." };
  }

  try {
    await db.insert(clientIntakeForms).values({
      userId,
      businessStage: businessStage as typeof businessStageEnum.enumValues[number],
      businessDescription,
      servicesNeeded,
      currentRevenue: currentRevenue || null,
      numberOfEmployees: numberOfEmployees || null,
      primaryGoals,
      biggestChallenges,
      howDidYouHear: howDidYouHear || null,
      additionalNotes: additionalNotes || null,
    });

    revalidatePath("/dashboard/intake-form");
    return { message: "Your intake form has been submitted successfully! Our team will review it shortly.", error: "" };
  } catch (error) {
    console.error("Error submitting intake form:", error);
    return { message: "", error: "Failed to submit intake form. Please try again." };
  }
}

export async function getUserIntakeForms(userId: number): Promise<ClientIntakeForm[]> {
  try {
    const forms = await db.query.clientIntakeForms.findMany({
      where: eq(clientIntakeForms.userId, userId),
      orderBy: [desc(clientIntakeForms.submittedAt)],
    });
    return forms;
  } catch (error) {
    console.error("Error fetching user intake forms:", error);
    return [];
  }
}

export type IntakeFormWithUser = ClientIntakeForm & { user: Pick<User, 'id' | 'name' | 'email' | 'phone'> };

export async function getAllIntakeForms(): Promise<IntakeFormWithUser[]> {
  try {
    const forms = await db.query.clientIntakeForms.findMany({
      orderBy: [desc(clientIntakeForms.submittedAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    return forms;
  } catch (error) {
    console.error("Error fetching all intake forms:", error);
    return [];
  }
}

export async function updateIntakeFormStatus(formId: number, newStatus: 'submitted' | 'reviewed' | 'archived'): Promise<FormState> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { message: "", error: "User not authenticated." };
  }

  try {
    await db.update(clientIntakeForms)
      .set({ status: newStatus })
      .where(eq(clientIntakeForms.id, formId));

    revalidatePath("/dashboard/admin/intake-forms");
    return { message: `Intake form marked as ${newStatus}.`, error: "" };
  } catch (error) {
    console.error("Error updating intake form status:", error);
    return { message: "", error: "Failed to update intake form status." };
  }
}

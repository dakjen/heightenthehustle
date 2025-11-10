'use server';

import { revalidatePath } from "next/cache";

export async function revalidateMessagesPath() {
  revalidatePath("/dashboard/messages");
}

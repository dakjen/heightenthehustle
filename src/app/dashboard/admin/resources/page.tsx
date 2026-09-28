import { redirect } from "next/navigation";
import { canAccessAdminArea, requireUser } from "@/lib/auth";
import { getAllResources } from "@/app/dashboard/resources/actions";
import ResourcesAdminClient from "./ResourcesAdminClient";

export const dynamic = "force-dynamic";

export default async function ResourcesAdminPage() {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) redirect("/dashboard");
  const resources = await getAllResources();
  return <ResourcesAdminClient resources={resources} />;
}

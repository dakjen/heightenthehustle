import { redirect } from "next/navigation";
import { canAccessAdminArea, requireUser } from "@/lib/auth";
import { getAllResources, getResourceStats } from "@/app/dashboard/resources/actions";
import ResourcesAdminClient from "./ResourcesAdminClient";

export const dynamic = "force-dynamic";

export default async function ResourcesAdminPage() {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) redirect("/dashboard");
  const [resources, stats] = await Promise.all([getAllResources(), getResourceStats()]);
  return <ResourcesAdminClient resources={resources} stats={stats} />;
}

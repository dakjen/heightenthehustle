import { redirect } from "next/navigation";
import { hasPermission, requireUser } from "@/lib/auth";
import { getCohortsWithWaitlist } from "@/app/dashboard/hth-class/cohort-actions";
import CohortsAdminClient from "./CohortsAdminClient";

export const dynamic = "force-dynamic";

export default async function CohortsAdminPage() {
  const user = await requireUser();
  if (!hasPermission(user, "canManageClasses")) redirect("/dashboard");

  const cohorts = await getCohortsWithWaitlist();
  return <CohortsAdminClient cohorts={cohorts} />;
}

import { redirect } from "next/navigation";
import { canAccessAdminArea, requireUser } from "@/lib/auth";
import { getAllSupportRequests, getTeamMembers } from "@/app/dashboard/support/actions";
import SupportAdminClient from "./SupportAdminClient";

export const dynamic = "force-dynamic";

export default async function SupportAdminPage() {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) redirect("/dashboard");
  const [requests, team] = await Promise.all([getAllSupportRequests(), getTeamMembers()]);
  return <SupportAdminClient requests={requests} team={team} />;
}

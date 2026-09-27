import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAllUserBusinesses } from "../businesses/actions";
import { getMySupportRequests } from "./actions";
import { SUPPORT_CATEGORIES } from "./constants";
import SupportClient from "./SupportClient";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const user = await requireUser();
  if (user.role !== "external") redirect("/dashboard/admin/support");

  const [requests, businesses] = await Promise.all([getMySupportRequests(), getAllUserBusinesses(user.id)]);
  return (
    <SupportClient
      requests={requests}
      categories={SUPPORT_CATEGORIES}
      businesses={businesses.filter((b) => !b.isArchived).map((b) => ({ id: b.id, businessName: b.businessName }))}
    />
  );
}

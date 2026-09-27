import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import YourBusinessesPageContent from "./YourBusinessesPageContent";

export const dynamic = "force-dynamic";

export default async function BusinessesPage() {
  const user = await requireUser();
  if (user.role !== "external") redirect("/dashboard/admin/businesses/manage"); // members only

  return <YourBusinessesPageContent />;
}

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import IntakeFormClientPage from "./IntakeFormClientPage";

export default async function IntakeFormPage() {
  const user = await requireUser();
  if (user.role !== "external") redirect("/dashboard"); // members only

  return <IntakeFormClientPage />;
}

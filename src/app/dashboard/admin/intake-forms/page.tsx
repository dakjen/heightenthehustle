import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import { getAllIntakeForms } from "@/app/dashboard/intake-form/actions";
import IntakeFormsAdminClientPage from "./IntakeFormsAdminClientPage";

export default async function AdminIntakeFormsPage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role !== 'admin' && session.user.role !== 'internal') {
    redirect("/dashboard");
  }

  const forms = await getAllIntakeForms();

  return <IntakeFormsAdminClientPage initialForms={forms} />;
}

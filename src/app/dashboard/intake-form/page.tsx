import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import IntakeFormClientPage from "./IntakeFormClientPage";

export default async function IntakeFormPage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/login");
  }

  return <IntakeFormClientPage />;
}

import { redirect } from "next/navigation";
import { hasPermission, requireUser } from "@/lib/auth";

/** Everything under /admin/businesses needs the businesses permission (admins always pass). */
export default async function AdminBusinessesLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!hasPermission(user, "canManageBusinesses")) redirect("/dashboard");
  return <>{children}</>;
}

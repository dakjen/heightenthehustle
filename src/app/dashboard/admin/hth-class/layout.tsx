import { redirect } from "next/navigation";
import { hasPermission, requireUser } from "@/lib/auth";

/** Everything under /admin/hth-class needs the classes permission (admins always pass). */
export default async function AdminClassesLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!hasPermission(user, "canManageClasses")) redirect("/dashboard");
  return <>{children}</>;
}

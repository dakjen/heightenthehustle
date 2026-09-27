import { redirect } from "next/navigation";
import { canAccessAdminArea, requireUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) redirect("/dashboard");

  return (
    <div className="flex-1 flex flex-col text-gray-900 p-6">
      {children}
    </div>
  );
}

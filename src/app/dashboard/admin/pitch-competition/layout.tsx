import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

/** Pitch competition admin is admin-only. */
export default async function AdminPitchLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return <>{children}</>;
}

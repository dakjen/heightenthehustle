import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { canAccessAdminArea, requireUser } from "@/lib/auth";
import { getAllDocuments } from "@/app/dashboard/documents/actions";
import { DOCUMENT_KINDS } from "@/app/dashboard/documents/constants";
import DocumentsAdminClient from "./DocumentsAdminClient";

export const dynamic = "force-dynamic";

export default async function DocumentsAdminPage() {
  const user = await requireUser();
  if (!canAccessAdminArea(user)) redirect("/dashboard");

  const [docs, members] = await Promise.all([
    getAllDocuments(),
    db.query.users.findMany({
      where: and(eq(users.role, "external"), eq(users.status, "approved")),
      columns: { id: true, name: true, email: true },
      orderBy: [users.name],
    }),
  ]);

  return <DocumentsAdminClient documents={docs} members={members} kinds={DOCUMENT_KINDS} />;
}

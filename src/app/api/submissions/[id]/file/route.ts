import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { assignmentSubmissions } from "@/db/schema";
import { getSession } from "@/app/login/actions";
import { hasPermission } from "@/lib/auth";

/** Private download of a homework file: the author or a teacher only. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const subId = Number(id);
  if (!Number.isInteger(subId)) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const sub = await db.query.assignmentSubmissions.findFirst({ where: eq(assignmentSubmissions.id, subId) });
  if (!sub || !sub.fileBlobPathname) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (sub.userId !== session.user.id && !hasPermission(session.user, "canManageClasses")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const result = await get(sub.fileBlobPathname, { access: "private" });
  if (!result) return NextResponse.json({ error: "File missing from storage" }, { status: 404 });
  const disposition = new URL(request.url).searchParams.get("download") === "1" ? "attachment" : "inline";
  const safeName = (sub.fileName ?? "submission").replace(/["\r\n]/g, "_");
  return new Response(result.stream, {
    headers: {
      "Content-Type": sub.fileContentType ?? "application/octet-stream",
      "Content-Disposition": `${disposition}; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

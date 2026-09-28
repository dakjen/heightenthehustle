import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getSession } from "@/app/login/actions";
import { canAccessAdminArea } from "@/lib/auth";

/**
 * Authenticated download for a private document.
 * Only the owner or an admin/team member may fetch it; the blob URL is never exposed.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const docId = Number(id);
  if (!Number.isInteger(docId)) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const doc = await db.query.documents.findFirst({ where: eq(documents.id, docId) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.ownerId !== session.user.id && !canAccessAdminArea(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await get(doc.blobPathname, { access: "private" });
  if (!result) return NextResponse.json({ error: "File missing from storage" }, { status: 404 });

  const disposition = new URL(_request.url).searchParams.get("download") === "1" ? "attachment" : "inline";
  const safeName = doc.fileName.replace(/["\r\n]/g, "_");
  return new Response(result.stream, {
    headers: {
      "Content-Type": doc.contentType,
      "Content-Length": String(doc.sizeBytes),
      "Content-Disposition": `${disposition}; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

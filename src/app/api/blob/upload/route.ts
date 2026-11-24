import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/session";
import { DIRECT_KINDS, directPrefix, isDirectKind, mayUpload } from "@/lib/direct-uploads";

/** Tells the signed-in user where and how they may upload a given kind of file. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const kind = new URL(request.url).searchParams.get("kind");
  if (!isDirectKind(kind) || !mayUpload(session.user, kind)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const rule = DIRECT_KINDS[kind];
  return NextResponse.json({ prefix: directPrefix(kind, session.user.id), access: rule.access, maxBytes: rule.maxBytes });
}

/**
 * Issues a short-lived upload token for one file. The token only allows the
 * signed-in user's own `uploads/<kind>/<userId>/` folder, the kind's file types
 * and its size limit.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await getSession();
        if (!session?.user) throw new Error("Unauthorized");
        if (!isDirectKind(clientPayload) || !mayUpload(session.user, clientPayload)) throw new Error("Not allowed");
        if (!pathname.startsWith(directPrefix(clientPayload, session.user.id)) || pathname.includes("..")) throw new Error("Bad upload path");
        const rule = DIRECT_KINDS[clientPayload];
        return { allowedContentTypes: rule.types, maximumSizeInBytes: rule.maxBytes, addRandomSuffix: true };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload not allowed" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { getSession } from "@/app/login/actions";

// Remembered for the life of the server instance, so each video is checked once.
const cache = new Map<string, { embeddable: boolean; at: number }>();
const TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Tells the page whether a YouTube video may be embedded. YouTube's oEmbed
 * endpoint answers 401/403 when the owner has disabled playback on other sites.
 * Done server-side so browser ad blockers can't interfere.
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[\w-]{6,20}$/.test(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return NextResponse.json({ embeddable: hit.embeddable });

  let embeddable = true; // if the check itself fails, try to embed as before
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, { cache: "no-store" });
    if (res.status === 401 || res.status === 403 || res.status === 404) embeddable = false;
  } catch {
    embeddable = true;
  }
  cache.set(id, { embeddable, at: Date.now() });
  return NextResponse.json({ embeddable }, { headers: { "Cache-Control": "private, max-age=3600" } });
}

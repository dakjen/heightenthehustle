/** Turns a YouTube / Vimeo / Loom share link into an embeddable player URL, or null. Hosts are whitelisted and ids validated. */
export function toEmbedUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const seg = url.pathname.split("/").filter(Boolean);
  const safeId = (s: string | undefined) => (s && /^[\w-]+$/.test(s) ? s : null);

  if (host === "youtu.be") {
    const id = safeId(seg[0]);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (seg[0] === "watch") {
      const id = safeId(url.searchParams.get("v") ?? undefined);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if ((seg[0] === "embed" || seg[0] === "shorts" || seg[0] === "live") && safeId(seg[1])) return `https://www.youtube.com/embed/${seg[1]}`;
    return null;
  }
  if (host === "vimeo.com") {
    const id = seg.find((s) => /^\d+$/.test(s));
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (host === "player.vimeo.com") {
    return seg[0] === "video" && /^\d+$/.test(seg[1] ?? "") ? `https://player.vimeo.com/video/${seg[1]}` : null;
  }
  if (host === "loom.com") {
    if ((seg[0] === "share" || seg[0] === "embed") && safeId(seg[1])) return `https://www.loom.com/embed/${seg[1]}`;
    return null;
  }
  return null;
}

export interface LessonVideo {
  title: string;
  url: string;
  embed: string;
}

/**
 * Pulls every embeddable video out of a Markdown string: `[Title](url)` links and bare URLs.
 * Order is preserved; duplicates (same embed) are dropped.
 */
export function extractVideos(markdown: string | null | undefined): LessonVideo[] {
  if (!markdown) return [];
  const out: LessonVideo[] = [];
  const seen = new Set<string>();
  const push = (title: string, url: string) => {
    const embed = toEmbedUrl(url);
    if (!embed || seen.has(embed)) return;
    seen.add(embed);
    out.push({ title: title.trim() || "Video", url, embed });
  };
  for (const m of markdown.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)) push(m[1], m[2]);
  const withoutLinks = markdown.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "");
  for (const m of withoutLinks.matchAll(/https?:\/\/[^\s<>)]+/g)) push("Video", m[0]);
  return out;
}

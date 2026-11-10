"use client";

import { useEffect, useState } from "react";

const YT_ID = /youtube\.com\/embed\/([\w-]+)/;

/**
 * Video embed (YouTube / Vimeo / Loom) as a plain iframe. For YouTube it first
 * asks our server whether the owner allows embedding; if not, it shows the
 * video's thumbnail with a "Watch on YouTube" button instead of YouTube's
 * black "Video unavailable" box.
 */
export default function VideoEmbed({ embed, url, title, className = "" }: { embed: string; url?: string; title: string; className?: string }) {
  const videoId = embed.match(YT_ID)?.[1] ?? null;
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    let alive = true;
    fetch(`/api/video-check?id=${videoId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { embeddable?: boolean } | null) => { if (alive && d && d.embeddable === false) setBlocked(true); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [videoId]);

  if (videoId && blocked) {
    const watchUrl = url ?? `https://www.youtube.com/watch?v=${videoId}`;
    return (
      <a href={watchUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch "${title}" on YouTube`} className={`group absolute inset-0 block bg-black ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:opacity-90" />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center text-white">
          <span className="flex h-14 w-20 items-center justify-center rounded-xl bg-[#910000] shadow-lg transition group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="rounded-full bg-black/70 px-4 py-1.5 text-sm font-semibold">Watch on YouTube ↗</span>
          <span className="text-xs text-white/80">This video only plays on YouTube.</span>
        </span>
      </a>
    );
  }

  return (
    <iframe
      src={embed}
      title={title}
      className={`absolute inset-0 h-full w-full ${className}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

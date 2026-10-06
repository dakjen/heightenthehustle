"use client";

import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement | string, opts: Record<string, unknown>) => unknown; PlayerState?: unknown };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise<void>((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

const YT_ID = /youtube\.com\/embed\/([\w-]+)/;

/**
 * Embeds a video. For YouTube it uses the IFrame API so that videos whose owner
 * disabled embedding (error 101/150) fall back to a thumbnail that links out,
 * instead of YouTube's black "Video unavailable" box.
 */
export default function VideoEmbed({ embed, url, title, className = "" }: { embed: string; url: string; title: string; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const hostRef = useRef<HTMLDivElement>(null);
  const [blocked, setBlocked] = useState(false);
  const videoId = embed.match(YT_ID)?.[1] ?? null;

  useEffect(() => {
    if (!videoId || !hostRef.current) return;
    let player: unknown;
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || !hostRef.current || !window.YT?.Player) return;
      player = new window.YT.Player(hostRef.current, {
        videoId,
        host: "https://www.youtube.com",
        playerVars: { rel: 0, modestbranding: 1, origin: window.location.origin },
        events: {
          onError: (e: { data: number }) => { if ([100, 101, 150].includes(e.data)) setBlocked(true); },
        },
      });
    });
    return () => {
      cancelled = true;
      const p = player as { destroy?: () => void } | undefined;
      p?.destroy?.();
    };
  }, [videoId]);

  if (videoId && blocked) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={`group relative block overflow-hidden rounded-[inherit] bg-black ${className}`} aria-label={`Watch "${title}" on YouTube`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition group-hover:opacity-100" />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
          <span className="flex h-14 w-20 items-center justify-center rounded-xl bg-[#ff0000] shadow-lg">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold">Watch on YouTube ↗</span>
        </span>
      </a>
    );
  }

  if (videoId) {
    return <div id={id} ref={hostRef} className={`absolute inset-0 h-full w-full ${className}`} />;
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

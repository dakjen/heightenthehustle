"use client";

import { useState } from "react";
import type { LessonVideo } from "@/lib/video";

/** Featured player with a playlist of the lesson's videos. */
export default function LessonVideos({ videos, lessonTitle }: { videos: LessonVideo[]; lessonTitle: string }) {
  const [index, setIndex] = useState(0);
  if (videos.length === 0) return null;
  const current = videos[Math.min(index, videos.length - 1)];

  return (
    <section className="mt-6 overflow-hidden rounded-2xl bg-[#2b2b2b] text-white shadow-lg hth-fade-up hth-fade-up-delay-1">
      <div className={`grid ${videos.length > 1 ? "lg:grid-cols-[2fr_1fr]" : ""}`}>
        <div>
          <div className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              key={current.embed}
              src={current.embed}
              title={current.title || lessonTitle}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="flex items-center justify-between gap-3 px-5 py-3">
            <p className="min-w-0 truncate font-semibold">{current.title}</p>
            <a href={current.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-gray-300 hover:text-white hover:underline">Open on site ↗</a>
          </div>
        </div>

        {videos.length > 1 && (
          <aside className="border-t border-white/10 lg:border-l lg:border-t-0">
            <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              {videos.length} videos in this lesson
            </p>
            <ol className="max-h-[22rem] overflow-y-auto pb-2 lg:max-h-none">
              {videos.map((v, i) => (
                <li key={v.embed}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-current={i === index ? "true" : undefined}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${i === index ? "bg-[#910000]" : "hover:bg-white/10"}`}
                  >
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === index ? "bg-white text-[#910000]" : "bg-white/15 text-white"}`}>
                      {i === index ? "▶" : i + 1}
                    </span>
                    <span className="text-sm leading-snug">{v.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </div>
    </section>
  );
}

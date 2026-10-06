"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setLessonComplete } from "../../course-actions";
import { FormError, primaryButtonClass, secondaryButtonClass } from "@/app/components/form";

const navLinkClass = "inline-flex items-center rounded-lg border-2 border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:border-gray-400";

type NavTarget = { href: string; title: string } | null;

interface LessonClientProps {
  lessonId: number;
  completed: boolean;
  courseHref: string;
  prev: NavTarget;
  next: NavTarget;
}

/** Lesson footer: prev/next navigation and the mark-complete toggle. */
export default function LessonClient({ lessonId, completed, courseHref, prev, next }: LessonClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function toggle(value: boolean, thenGo?: string) {
    setError("");
    startTransition(async () => {
      const res = await setLessonComplete(lessonId, value);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (thenGo) {
        router.push(thenGo);
      }
      router.refresh();
    });
  }

  return (
    <footer className="mt-6 hth-fade-up hth-fade-up-delay-2">
      {completed ? (
        <div className="flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 font-semibold text-green-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs text-white" aria-hidden="true">✓</span>
            Lesson complete
          </p>
          <button type="button" onClick={() => toggle(false)} disabled={pending} className="text-sm font-semibold text-green-800 underline underline-offset-2 hover:text-green-900 disabled:opacity-60 sm:text-right">
            {pending ? "Saving…" : "Mark incomplete"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {next ? (
            <>
              <button type="button" onClick={() => toggle(true, next.href)} disabled={pending} className={primaryButtonClass}>
                {pending ? "Saving…" : "Mark complete & continue"}
              </button>
              <button type="button" onClick={() => toggle(true)} disabled={pending} className={secondaryButtonClass}>
                Mark complete
              </button>
            </>
          ) : (
            <button type="button" onClick={() => toggle(true)} disabled={pending} className={primaryButtonClass}>
              {pending ? "Saving…" : "Mark complete"}
            </button>
          )}
        </div>
      )}

      {error && <div className="mt-3"><FormError message={error} /></div>}

      <nav aria-label="Lesson navigation" className="mt-6 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={prev.href} className={`${navLinkClass} justify-start text-left`}>
            <span className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">Previous</span>
              <span className="line-clamp-1">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <Link href={courseHref} className={`${navLinkClass} justify-start text-left`}>
            <span className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">Back to</span>
              <span>All lessons</span>
            </span>
          </Link>
        )}
        {next ? (
          <Link href={next.href} className={`${navLinkClass} justify-end text-right`}>
            <span className="flex flex-col items-end">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">Next</span>
              <span className="line-clamp-1">{next.title}</span>
            </span>
          </Link>
        ) : (
          <Link href={courseHref} className={`${navLinkClass} justify-end text-right`}>
            <span className="flex flex-col items-end">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">Last lesson</span>
              <span>Back to course</span>
            </span>
          </Link>
        )}
      </nav>
    </footer>
  );
}

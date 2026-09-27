"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "hth-welcome-jan-cohort-dismissed";

/**
 * One-time welcome announcement shown on the dashboard home page.
 * Dismissal is remembered per browser session so it doesn't nag on every visit.
 */
export default function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      // Storage unavailable (private mode, etc.) — show it anyway.
      setOpen(true);
    }
  }, []);

  function close() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl hth-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-[#2b2b2b] hth-stripes text-white px-8 pt-8 pb-10 overflow-hidden">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#910000] opacity-50 blur-2xl" />
          <p className="relative text-[#ff8a8a] uppercase tracking-[0.3em] text-xs font-semibold mb-3">
            Welcome to HTH
          </p>
          <h2 id="welcome-title" className="relative text-5xl leading-none">
            Our curriculum cohort<br />opens in <span className="text-[#ff5c5c]">January</span>
          </h2>
        </div>

        <div className="px-8 py-7">
          <p className="text-[#606060]">
            Welcome to the Heighten The Hustle portal! Our next curriculum cohort kicks off in January.
            Complete your profile and add your business details so you&apos;re ready when enrollment opens.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/businesses"
              onClick={close}
              className="flex-1 text-center px-5 py-2.5 bg-[#910000] text-white font-semibold rounded-lg shadow-md hover:bg-[#7a0000] transition-colors"
            >
              Get started
            </Link>
            <button
              type="button"
              onClick={close}
              className="flex-1 px-5 py-2.5 bg-white text-[#606060] font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

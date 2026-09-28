"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

interface Props {
  name: string;
  roleLabel: string;
  photoUrl: string | null;
}

/** Bottom-of-sidebar account block: click to open Profile / Settings / Logout. */
export default function SidebarUserMenu({ name, roleLabel, photoUrl }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const onAccountPage = pathname.startsWith("/dashboard/profile") || pathname.startsWith("/dashboard/settings");

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const item = "block w-full text-left rounded-md px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white transition-colors";

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg bg-[#1f1f1f] p-1 shadow-xl ring-1 ring-white/10 hth-pop" role="menu">
          <Link href="/dashboard/profile" className={item} role="menuitem">My profile</Link>
          <Link href="/dashboard/settings" className={item} role="menuitem">Settings</Link>
          <div className="my-1 border-t border-white/10" />
          <form action={logout}>
            <button type="submit" className={`${item} text-[#ff8a8a] hover:text-white`} role="menuitem">Log out</button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/10 ${open || onAccountPage ? "bg-white/10" : ""}`}
      >
        {photoUrl ? (
          <Image src={photoUrl} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/20" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#910000] font-display text-lg leading-none text-white">
            {(name || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-gray-400">{roleLabel} · Profile &amp; settings</p>
        </div>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>
          <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.83l-3.71 3.94a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

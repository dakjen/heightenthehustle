import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Shared frame for the login and account-request pages. */
export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col">
      <div className="hth-accent-bar rounded-none" />

      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-[#606060] hover:text-[#910000] flex items-center text-sm font-medium transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back
        </Link>
        <Link href="/">
          <Image src="/hthlogo.png" alt="Heighten The Hustle" width={120} height={40} className="h-8 w-auto" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md hth-card p-8 sm:p-10 hth-fade-up">
          <h1 className="text-5xl text-gray-900 text-center">{title}</h1>
          {subtitle && <p className="mt-3 text-center text-[#606060]">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

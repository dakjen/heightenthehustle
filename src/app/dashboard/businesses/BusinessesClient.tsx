"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CreateBusinessForm from "./CreateBusinessForm";

export interface BusinessSummary {
  id: number;
  businessName: string;
  ownerName: string;
  businessType: string;
  businessIndustry: string;
  city: string | null;
  state: string | null;
  isArchived: boolean;
  logoUrl: string | null;
}

interface BusinessesClientProps {
  businesses: BusinessSummary[];
  ownerName: string;
}

export default function BusinessesClient({ businesses, ownerName }: BusinessesClientProps) {
  const [adding, setAdding] = useState(false);
  const hasBusiness = businesses.length > 0;

  // First visit: open straight into the form.
  if (!hasBusiness) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <header className="mb-8 hth-fade-up">
          <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Your Business</p>
          <h1 className="text-5xl text-gray-900 leading-none">Let&apos;s set up your business.</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            This takes about five minutes. Once it&apos;s saved you&apos;ll unlock messaging, classes and funding
            opportunities matched to your business.
          </p>
        </header>
        <div className="hth-fade-up hth-fade-up-delay-1">
          <CreateBusinessForm defaultOwnerName={ownerName} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between hth-fade-up">
        <div>
          <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Your Business</p>
          <h1 className="text-5xl text-gray-900 leading-none">
            {businesses.length === 1 ? businesses[0].businessName : "Your businesses"}
          </h1>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center justify-center rounded-lg border-2 border-[#910000] bg-white px-5 py-2.5 font-semibold text-[#910000] transition hover:bg-[#910000] hover:text-white"
          >
            + Add another business
          </button>
        )}
      </header>

      <div className="space-y-4 hth-fade-up hth-fade-up-delay-1">
        {businesses.map((b) => (
          <Link
            key={b.id}
            href={`/dashboard/businesses/${b.id}`}
            className={`hth-card flex items-center gap-5 p-5 transition hover:shadow-lg ${b.isArchived ? "opacity-60" : ""}`}
          >
            {b.logoUrl ? (
              <Image src={b.logoUrl} alt="" width={56} height={56} className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#2b2b2b] font-display text-2xl text-white">
                {b.businessName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-2xl text-gray-900 leading-tight">{b.businessName}</h2>
              <p className="text-sm text-gray-600">
                {b.businessIndustry} · {b.businessType}
                {b.city && b.state ? ` · ${b.city}, ${b.state}` : ""}
              </p>
              {b.isArchived && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-red-700">Archived</p>}
            </div>
            <span className="hidden shrink-0 text-sm font-semibold text-[#910000] sm:block">View &amp; edit →</span>
          </Link>
        ))}
      </div>

      {adding && (
        <div className="mt-10 hth-pop">
          <h2 className="mb-4 text-3xl text-gray-900">Add another business</h2>
          <CreateBusinessForm defaultOwnerName={ownerName} onCancel={() => setAdding(false)} />
        </div>
      )}
    </div>
  );
}

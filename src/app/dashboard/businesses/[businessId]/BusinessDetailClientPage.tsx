"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBusinessProfile } from "../actions";
import { Demographic, BusinessWithLocation, type Location as LocationType } from "@/db/schema";
import EditBusinessProfileForm from "./EditBusinessProfileForm";
import BusinessDetailsForm from "./BusinessDetailsForm";
import BusinessMaterials from "./BusinessMaterials";
import { secondaryButtonClass } from "@/app/components/form";

type Tab = "overview" | "owner" | "documents" | "edit";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "owner", label: "Owner & location" },
  { id: "documents", label: "Documents" },
  { id: "edit", label: "Edit profile" },
];

interface Props {
  initialBusiness: BusinessWithLocation;
  availableDemographics: Demographic[];
  availableLocations: LocationType[];
}

export default function BusinessDetailClientPage({ initialBusiness, availableDemographics, availableLocations }: Props) {
  const [business, setBusiness] = useState<BusinessWithLocation>(initialBusiness);
  const [tab, setTab] = useState<Tab>("overview");

  const refresh = useCallback(async () => {
    const updated = await getBusinessProfile(business.id);
    if (updated) setBusiness(updated);
  }, [business.id]);

  const address = [business.streetAddress, [business.city, business.state].filter(Boolean).join(", "), business.zipCode].filter(Boolean).join(" · ");
  const materials = [1, 2, 3, 4, 5]
    .map((i) => ({ url: business[`material${i}Url` as keyof BusinessWithLocation] as string | null, title: business[`material${i}Title` as keyof BusinessWithLocation] as string | null, i }))
    .filter((m) => m.url);
  const facts: [string, string | null | undefined][] = [
    ["Owner", `${business.ownerName} · ${business.percentOwnership}%`],
    ["Industry", business.businessIndustry],
    ["Entity type", business.businessType],
    ["Tax status", business.businessTaxStatus],
    ["NAICS", business.naicsCode],
    ["Phone", business.phone],
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Link href="/dashboard/businesses" className="mb-4 inline-block text-sm font-semibold text-[#910000] hover:underline">← Your businesses</Link>

      {/* Header */}
      <header className="relative overflow-hidden rounded-2xl bg-[#2b2b2b] hth-stripes text-white hth-fade-up">
        {business.businessProfilePhotoUrl && (
          <Image src={business.businessProfilePhotoUrl} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2b2b2b] via-[#2b2b2b]/85 to-[#2b2b2b]/40" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#910000] opacity-40 blur-3xl" />
        <div className="relative flex flex-col gap-6 p-8 sm:flex-row sm:items-center lg:p-10">
          {business.logoUrl ? (
            <Image src={business.logoUrl} alt={`${business.businessName} logo`} width={112} height={112} className="h-28 w-28 shrink-0 rounded-2xl bg-white object-cover ring-4 ring-white/10" />
          ) : (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-[#910000] font-display text-6xl leading-none ring-4 ring-white/10">
              {business.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[#ff8a8a] uppercase tracking-[0.3em] text-xs font-semibold mb-2">{business.businessIndustry}</p>
            <h1 className="text-5xl leading-none lg:text-6xl">{business.businessName}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-1">{business.businessType}</span>
              {business.city && <span className="rounded-full bg-white/10 px-3 py-1">{[business.city, business.state].filter(Boolean).join(", ")}</span>}
              {business.isArchived && <span className="rounded-full bg-red-500/30 px-3 py-1 font-semibold">Archived</span>}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-300">
              {business.website && (
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                  {business.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
              {business.phone && <a href={`tel:${business.phone}`} className="hover:text-white hover:underline">{business.phone}</a>}
            </div>
          </div>
          <button type="button" onClick={() => setTab("edit")} className="shrink-0 rounded-lg border-2 border-white/40 px-5 py-2.5 font-semibold text-white transition hover:border-white hover:bg-white/10">
            Edit profile
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="mt-6 flex flex-wrap gap-2 hth-fade-up hth-fade-up-delay-1" aria-label="Business sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t.id ? "bg-[#910000] text-white shadow-md" : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6 hth-fade-up hth-fade-up-delay-2">
        {tab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="hth-card p-7 lg:col-span-2">
              <h2 className="text-2xl text-gray-900 mb-3">About</h2>
              {business.businessDescription ? (
                <p className="whitespace-pre-line text-gray-700">{business.businessDescription}</p>
              ) : (
                <p className="text-gray-500">No description yet. <button type="button" onClick={() => setTab("edit")} className="font-semibold text-[#910000] hover:underline">Add one</button>.</p>
              )}
              {address && (
                <>
                  <h3 className="mt-6 text-xs uppercase tracking-wide text-gray-500">Address</h3>
                  <p className="mt-1 text-gray-800">{address}</p>
                </>
              )}
            </section>
            <section className="hth-card p-7">
              <h2 className="text-2xl text-gray-900 mb-3">At a glance</h2>
              <dl className="space-y-3">
                {facts.filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wide text-gray-500">{k}</dt>
                    <dd className="font-medium text-gray-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="hth-card p-7 lg:col-span-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl text-gray-900">Materials</h2>
                <button type="button" onClick={() => setTab("documents")} className={`${secondaryButtonClass} py-1.5 text-sm`}>Manage</button>
              </div>
              {materials.length === 0 ? (
                <p className="mt-2 text-gray-500">No materials uploaded yet. Add a pitch deck, one-pager or brochure.</p>
              ) : (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {materials.map((m) => (
                    <li key={m.i}>
                      <a href={m.url!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:border-[#910000] hover:text-[#910000]">
                        <span className="flex h-8 w-8 items-center justify-center rounded bg-[#2b2b2b] text-[10px] font-bold uppercase text-white">doc</span>
                        {m.title || `Document ${m.i}`}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-gray-500">
                Sensitive files like W-9s belong in <Link href="/dashboard/documents" className="font-semibold text-[#910000] hover:underline">My Documents</Link>, which is private.
              </p>
            </section>
          </div>
        )}

        {tab === "owner" && (
          <BusinessDetailsForm initialBusiness={business} availableDemographics={availableDemographics} availableLocations={availableLocations} onBusinessUpdate={refresh} />
        )}

        {tab === "documents" && <BusinessMaterials business={business} onSaved={refresh} />}

        {tab === "edit" && (
          <EditBusinessProfileForm initialBusiness={business} availableDemographics={availableDemographics} availableLocations={availableLocations} onSaved={async () => { await refresh(); setTab("overview"); }} />
        )}
      </div>
    </div>
  );
}

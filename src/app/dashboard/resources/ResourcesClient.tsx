"use client";

import { useMemo, useState } from "react";
import type { Resource } from "@/db/schema";
import { RESOURCE_CATEGORIES, type ResourceCategory } from "./constants";
import { inputClass } from "@/app/components/form";

type Tab = "All" | ResourceCategory;

const CATEGORY_CLS: Record<ResourceCategory, string> = {
  "Grants & Opportunities": "bg-green-100 text-green-800",
  "Business Resources": "bg-[#2b2b2b]/10 text-[#2b2b2b]",
  "Deals & Discounts": "bg-yellow-100 text-yellow-800",
};

const EMPTY_COPY: Record<Tab, string> = {
  All: "No resources posted yet. Check back soon.",
  "Grants & Opportunities": "No grants or opportunities are open right now.",
  "Business Resources": "No business resources posted yet.",
  "Deals & Discounts": "No deals or discounts right now.",
};

const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const DAY_MS = 86_400_000;

function deadlineInfo(deadline: Date | string | null): { label: string; closed: boolean } | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const days = Math.ceil((d.getTime() - Date.now()) / DAY_MS);
  if (days < 0) return { label: `Closed ${date.format(d)}`, closed: true };
  const rel = days === 0 ? "Closes today" : days === 1 ? "Closes tomorrow" : `Closes in ${days} days`;
  return { label: `${rel} · ${date.format(d)}`, closed: false };
}

function CopyChip({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable; user can still select the text */
    }
  };
  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 pl-3 pr-1 py-1">
      <span className="text-xs text-gray-500">Code</span>
      <code className="font-mono text-sm font-semibold tracking-wider text-gray-900 select-all">{code}</code>
      <button type="button" onClick={copy} className="rounded-md px-2 py-1 text-xs font-semibold text-[#910000] hover:bg-[#910000]/10" aria-label={`Copy code ${code}`}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function ResourceCard({ r }: { r: Resource }) {
  const dl = deadlineInfo(r.deadline);
  return (
    <article className={`hth-card flex h-full flex-col p-5 ${r.isFeatured ? "border-l-4 border-l-[#910000]" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_CLS[r.category]}`}>{r.category}</span>
        {r.isFeatured && <span className="text-xs font-semibold uppercase tracking-wide text-[#910000]">Featured</span>}
      </div>
      <h3 className="mt-2 text-xl leading-tight text-gray-900">{r.title}</h3>
      {r.provider && <p className="text-sm text-gray-500">{r.provider}</p>}
      {r.description && <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{r.description}</p>}

      {(r.amount || dl) && (
        <div className="mt-3 space-y-1 text-sm">
          {r.amount && <p className="font-semibold text-gray-900">{r.amount}</p>}
          {dl && <p className={dl.closed ? "text-gray-500" : "text-[#910000] font-medium"}>{dl.label}</p>}
        </div>
      )}

      {r.discountCode && <CopyChip code={r.discountCode} />}

      {r.tags && r.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.tags.map((t) => (
            <span key={t} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{t}</span>
          ))}
        </div>
      )}

      {r.url && (
        <div className="mt-auto pt-4">
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#910000] hover:underline">
            Open →
          </a>
        </div>
      )}
    </article>
  );
}

export default function ResourcesClient({ resources }: { resources: Resource[] }) {
  const [tab, setTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { All: resources.length, "Grants & Opportunities": 0, "Business Resources": 0, "Deals & Discounts": 0 };
    for (const r of resources) c[r.category] += 1;
    return c;
  }, [resources]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (tab !== "All" && r.category !== tab) return false;
      if (!q) return true;
      const hay = [r.title, r.description, r.provider, ...(r.tags ?? [])].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [resources, tab, query]);

  const tabs: Tab[] = ["All", ...RESOURCE_CATEGORIES];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <header className="mb-6 hth-fade-up">
        <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Resources Hub</p>
        <h1 className="text-5xl text-gray-900 leading-none">Grants, tools and deals for your business</h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600">
          Funding to apply for, tools worth knowing about, and member discounts from our partners. Updated by the team as new opportunities come in.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between hth-fade-up hth-fade-up-delay-1">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Resource categories">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t ? "bg-[#910000] text-white" : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"}`}
            >
              {t} <span className={`ml-1 text-xs ${tab === t ? "text-white/80" : "text-gray-400"}`}>{counts[t]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, provider or tag…"
          aria-label="Search resources"
          className={`${inputClass} md:w-72`}
        />
      </div>

      {shown.length === 0 ? (
        <div className="hth-card p-10 text-center hth-fade-up hth-fade-up-delay-1">
          <p className="text-gray-600">{query.trim() ? `Nothing matches "${query.trim()}".` : EMPTY_COPY[tab]}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 hth-fade-up hth-fade-up-delay-1">
          {shown.map((r) => <ResourceCard key={r.id} r={r} />)}
        </div>
      )}
    </div>
  );
}

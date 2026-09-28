"use client";

import { useState } from "react";
import type { SupportRequest } from "@/db/schema";
import SupportRequestForm from "./SupportRequestForm";
import { secondaryButtonClass, ghostButtonClass } from "@/app/components/form";

const STATUS: Record<SupportRequest["status"], { label: string; cls: string }> = {
  open: { label: "Received", cls: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "In progress", cls: "bg-[#2b2b2b]/10 text-[#2b2b2b]" },
  resolved: { label: "Resolved", cls: "bg-green-100 text-green-800" },
  closed: { label: "Closed", cls: "bg-gray-100 text-gray-700" },
};
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

interface Props {
  requests: SupportRequest[];
  categories: readonly string[];
  businesses: { id: number; businessName: string }[];
}

export default function SupportClient({ requests, categories, businesses }: Props) {
  const [showForm, setShowForm] = useState(requests.length === 0);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between hth-fade-up">
        <div>
          <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Specialized Support</p>
          <h1 className="text-5xl text-gray-900 leading-none">Hit a wall? Tell us.</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            Emergencies, disputes, a lease problem, a contract you don&apos;t understand, cash running short. Whatever the issue,
            describe it here and an HTH advisor will get on it with you.
          </p>
        </div>
        {requests.length > 0 && (
          <button type="button" onClick={() => setShowForm((v) => !v)} className={showForm ? ghostButtonClass : secondaryButtonClass}>
            {showForm ? "Cancel" : "+ New request"}
          </button>
        )}
      </header>

      {showForm && (
        <div className="mb-8 hth-fade-up hth-fade-up-delay-1">
          <SupportRequestForm categories={categories} businesses={businesses} onDone={requests.length > 0 ? () => setShowForm(false) : undefined} />
        </div>
      )}

      {requests.length > 0 && (
        <section className="hth-fade-up hth-fade-up-delay-1">
          <h2 className="mb-3 text-3xl text-gray-900">Your requests</h2>
          <div className="space-y-3">
            {requests.map((r) => (
              <article key={r.id} className="hth-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{r.category}</p>
                    <h3 className="text-xl text-gray-900 leading-tight">{r.subject}</h3>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{r.details}</p>
                <p className="mt-3 text-xs text-gray-500">
                  Sent {date.format(new Date(r.createdAt))}
                  {r.amountNeeded ? ` · ${r.amountNeeded}` : ""}
                  {r.neededBy ? ` · needed by ${date.format(new Date(r.neededBy))}` : ""}
                  {r.urgency === "high" ? " · marked urgent" : ""}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

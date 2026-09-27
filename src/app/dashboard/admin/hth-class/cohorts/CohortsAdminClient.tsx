"use client";

import { useActionState, useState, useTransition } from "react";
import { createCohort, updateCohortStatus, deleteCohort, removeWaitlistEntry, type CohortWithWaitlist } from "@/app/dashboard/hth-class/cohort-actions";
import { FormState } from "@/types/form-state";
import { Field, FormSection, SubmitButton, FormError, FormSuccess, inputClass, checkboxClass, secondaryButtonClass, invalidProps } from "@/app/components/form";

const longDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const STATUS_LABELS: Record<CohortWithWaitlist["status"], string> = {
  upcoming: "Upcoming",
  open: "Enrollment open",
  in_progress: "In progress",
  completed: "Completed",
};

function toCsv(c: CohortWithWaitlist): string {
  const esc = (v: string | null | undefined) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = [["Name", "Email", "Phone", "Business", "Notes", "Joined"].map(esc).join(",")];
  for (const w of c.waitlist) {
    rows.push([w.name, w.email, w.phone, w.businessName, w.notes, new Date(w.createdAt).toISOString()].map(esc).join(","));
  }
  return rows.join("\n");
}

function downloadCsv(c: CohortWithWaitlist) {
  const blob = new Blob([toCsv(c)], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${c.name.replace(/[^\w-]+/g, "_")}_waitlist.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function CreateCohortForm() {
  const [state, formAction] = useActionState<FormState, FormData>(createCohort, { message: "" });
  const errors = state.fieldErrors ?? {};
  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormSection title="New cohort" description="Members see the soonest cohort with an open waitlist on their HTH Class tab.">
        <Field name="name" label="Cohort name" required error={errors.name}>
          <input id="name" name="name" type="text" required placeholder="January 2027 Cohort" className={inputClass} {...invalidProps("name", errors)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field name="startDate" label="Start date" required error={errors.startDate}>
            <input id="startDate" name="startDate" type="date" required className={inputClass} {...invalidProps("startDate", errors)} />
          </Field>
          <Field name="endDate" label="End date" error={errors.endDate}>
            <input id="endDate" name="endDate" type="date" className={inputClass} {...invalidProps("endDate", errors)} />
          </Field>
        </div>
        <Field name="description" label="Description" error={errors.description} className="sm:col-span-2" hint="Shown to members on the announcement. Leave blank for the default blurb.">
          <textarea id="description" name="description" rows={2} className={inputClass} />
        </Field>
        <label className="flex items-center gap-3 text-sm text-gray-800 sm:col-span-2">
          <input type="checkbox" name="isWaitlistOpen" defaultChecked className={checkboxClass} />
          Waitlist is open (members can join)
        </label>
        <div className="sm:col-span-2 space-y-3">
          <FormError message={state.error} />
          <FormSuccess message={state.message} />
          <SubmitButton pendingText="Creating…">Create cohort</SubmitButton>
        </div>
      </FormSection>
    </form>
  );
}

function CohortCard({ cohort }: { cohort: CohortWithWaitlist }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string>("");

  const run = (fn: () => Promise<FormState>) =>
    startTransition(async () => {
      const r = await fn();
      setMsg(r.error || r.message);
    });

  return (
    <section className="hth-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-3xl leading-none text-gray-900">{cohort.name}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cohort.isWaitlistOpen ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
              {cohort.isWaitlistOpen ? "Waitlist open" : "Waitlist closed"}
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">{STATUS_LABELS[cohort.status]}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {cohort.startDate ? `Starts ${longDate.format(new Date(cohort.startDate))}` : "No start date"}
            {cohort.endDate ? ` · Ends ${longDate.format(new Date(cohort.endDate))}` : ""}
            {` · ${cohort.waitlist.length} on waitlist`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Cohort status"
            disabled={pending}
            value={cohort.status}
            onChange={(e) => run(() => updateCohortStatus(cohort.id, e.target.value as CohortWithWaitlist["status"], cohort.isWaitlistOpen))}
            className={`${inputClass} w-auto py-1.5 text-sm`}
          >
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button type="button" disabled={pending} onClick={() => run(() => updateCohortStatus(cohort.id, cohort.status, !cohort.isWaitlistOpen))} className={`${secondaryButtonClass} py-1.5 text-sm`}>
            {cohort.isWaitlistOpen ? "Close waitlist" : "Open waitlist"}
          </button>
          {cohort.waitlist.length > 0 && (
            <button type="button" onClick={() => downloadCsv(cohort)} className={`${secondaryButtonClass} py-1.5 text-sm`}>
              Export CSV
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => { if (confirm(`Delete "${cohort.name}" and its ${cohort.waitlist.length} waitlist entries?`)) run(() => deleteCohort(cohort.id)); }}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
      {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}

      {cohort.waitlist.length === 0 ? (
        <p className="mt-5 text-sm text-gray-500">Nobody on the waitlist yet.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Business</th>
                <th className="py-2 pr-4">Notes</th>
                <th className="py-2 pr-4">Joined</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {cohort.waitlist.map((w, i) => (
                <tr key={w.id} className="border-b border-gray-100 align-top">
                  <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                  <td className="py-2 pr-4 font-medium text-gray-900">{w.name}</td>
                  <td className="py-2 pr-4"><a href={`mailto:${w.email}`} className="text-[#910000] hover:underline">{w.email}</a></td>
                  <td className="py-2 pr-4 text-gray-700">{w.phone ?? "—"}</td>
                  <td className="py-2 pr-4 text-gray-700">{w.businessName ?? "—"}</td>
                  <td className="max-w-xs py-2 pr-4 text-gray-600">{w.notes ?? "—"}</td>
                  <td className="py-2 pr-4 whitespace-nowrap text-gray-600">{longDate.format(new Date(w.createdAt))}</td>
                  <td className="py-2">
                    <button type="button" disabled={pending} onClick={() => { if (confirm(`Remove ${w.name} from the waitlist?`)) run(() => removeWaitlistEntry(w.id)); }} className="text-xs font-semibold text-red-700 hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function CohortsAdminClient({ cohorts }: { cohorts: CohortWithWaitlist[] }) {
  const [showCreate, setShowCreate] = useState(cohorts.length === 0);
  return (
    <div className="w-full max-w-5xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">HTH Curriculum</p>
          <h1 className="text-5xl text-gray-900 leading-none">Cohorts &amp; waitlist</h1>
          <p className="mt-2 text-gray-600">Create a cohort with a start date. Members join its waitlist from their HTH Class tab.</p>
        </div>
        <button type="button" onClick={() => setShowCreate((v) => !v)} className={secondaryButtonClass}>
          {showCreate ? "Hide form" : "+ New cohort"}
        </button>
      </header>

      {showCreate && <div className="mb-8 hth-pop"><CreateCohortForm /></div>}

      <div className="space-y-6">
        {cohorts.length === 0 && !showCreate && <p className="text-gray-600">No cohorts yet. Create one to open the waitlist.</p>}
        {cohorts.map((c) => <CohortCard key={c.id} cohort={c} />)}
      </div>
    </div>
  );
}

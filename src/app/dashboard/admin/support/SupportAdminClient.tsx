"use client";

import { useMemo, useState, useTransition } from "react";
import { updateSupportRequest, type SupportRequestWithUser, type SupportStatus } from "@/app/dashboard/support/actions";
import { inputClass, secondaryButtonClass } from "@/app/components/form";

const STATUS_LABEL: Record<SupportStatus, string> = { open: "Open", in_progress: "In progress", resolved: "Resolved", closed: "Closed" };
const STATUS_CLS: Record<SupportStatus, string> = {
  open: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
};
const URGENCY_CLS = { low: "text-gray-500", normal: "text-gray-700", high: "text-red-700 font-semibold" } as const;
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function RequestCard({ r, team }: { r: SupportRequestWithUser; team: { id: number; name: string }[] }) {
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState(r.adminNotes ?? "");
  const [msg, setMsg] = useState("");
  const save = (patch: Parameters<typeof updateSupportRequest>[1]) =>
    start(async () => {
      const res = await updateSupportRequest(r.id, patch);
      setMsg(res.error || res.message);
      setTimeout(() => setMsg(""), 2000);
    });

  return (
    <article className="hth-card p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
            <span className="text-xs uppercase tracking-wide text-gray-500">{r.category}</span>
            <span className={`text-xs ${URGENCY_CLS[r.urgency]}`}>{r.urgency} urgency</span>
          </div>
          <h2 className="mt-1 text-2xl leading-tight text-gray-900">{r.subject}</h2>
          <p className="text-sm text-gray-600">
            <a href={`mailto:${r.user.email}`} className="font-medium text-[#910000] hover:underline">{r.user.name}</a>
            {" · "}{r.user.email}{" · "}{r.user.phone}
            {r.business ? ` · ${r.business.businessName}` : ""}
          </p>
          <p className="mt-3 whitespace-pre-line text-sm text-gray-800">{r.details}</p>
          <p className="mt-2 text-xs text-gray-500">
            Sent {date.format(new Date(r.createdAt))}
            {r.amountNeeded ? ` · Amount: ${r.amountNeeded}` : ""}
            {r.neededBy ? ` · Needed by ${date.format(new Date(r.neededBy))}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 lg:w-56">
          <label className="text-xs font-medium text-gray-600">
            Status
            <select disabled={pending} value={r.status} onChange={(e) => save({ status: e.target.value as SupportStatus })} className={`${inputClass} mt-1 py-1.5 text-sm`}>
              {(Object.keys(STATUS_LABEL) as SupportStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-gray-600">
            Assigned to
            <select disabled={pending} value={r.assignedToId ?? ""} onChange={(e) => save({ assignedToId: e.target.value ? Number(e.target.value) : null })} className={`${inputClass} mt-1 py-1.5 text-sm`}>
              <option value="">Unassigned</option>
              {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className="mt-4">
        <label className="text-xs font-medium text-gray-600" htmlFor={`notes-${r.id}`}>Internal notes (members don&apos;t see this)</label>
        <div className="mt-1 flex gap-2">
          <textarea id={`notes-${r.id}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} text-sm`} />
          <button type="button" disabled={pending || notes === (r.adminNotes ?? "")} onClick={() => save({ adminNotes: notes })} className={`${secondaryButtonClass} self-start py-2 text-sm disabled:opacity-50`}>
            Save
          </button>
        </div>
        {msg && <p className="mt-1 text-xs text-gray-600">{msg}</p>}
      </div>
    </article>
  );
}

export default function SupportAdminClient({ requests, team }: { requests: SupportRequestWithUser[]; team: { id: number; name: string }[] }) {
  const [filter, setFilter] = useState<"active" | "all">("active");
  const shown = useMemo(() => (filter === "all" ? requests : requests.filter((r) => r.status === "open" || r.status === "in_progress")), [requests, filter]);
  const openCount = requests.filter((r) => r.status === "open").length;

  return (
    <div className="w-full max-w-5xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Admin</p>
          <h1 className="text-5xl text-gray-900 leading-none">Support requests</h1>
          <p className="mt-2 text-gray-600">{openCount} open · {requests.length} total</p>
        </div>
        <div className="flex gap-2">
          {(["active", "all"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === f ? "bg-[#910000] text-white" : "bg-white text-gray-700 border border-gray-300"}`}>
              {f === "active" ? "Open & in progress" : "All"}
            </button>
          ))}
        </div>
      </header>
      {shown.length === 0 ? (
        <p className="text-gray-600">Nothing here right now.</p>
      ) : (
        <div className="space-y-4">{shown.map((r) => <RequestCard key={r.id} r={r} team={team} />)}</div>
      )}
    </div>
  );
}

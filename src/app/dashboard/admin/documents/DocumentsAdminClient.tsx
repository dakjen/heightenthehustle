"use client";

import { useMemo, useState } from "react";
import type { DocumentWithMeta } from "@/app/dashboard/documents/actions";
import DocumentList from "@/app/dashboard/documents/DocumentList";
import DocumentUploadForm from "@/app/dashboard/documents/DocumentUploadForm";
import { inputClass, secondaryButtonClass, ghostButtonClass } from "@/app/components/form";

interface Member { id: number; name: string; email: string }

export default function DocumentsAdminClient({ documents, members, kinds }: { documents: DocumentWithMeta[]; members: Member[]; kinds: readonly string[] }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [uploadFor, setUploadFor] = useState<Member | null>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return documents.filter((d) => {
      if (kind && d.kind !== kind) return false;
      if (!needle) return true;
      return [d.title, d.fileName, d.owner.name, d.owner.email, d.business?.businessName ?? "", d.notes ?? ""].some((v) => v.toLowerCase().includes(needle));
    });
  }, [documents, q, kind]);

  // Which members are missing a W-9?
  const withW9 = new Set(documents.filter((d) => d.kind === "W-9").map((d) => d.ownerId));
  const missingW9 = members.filter((m) => !withW9.has(m.id));

  return (
    <div className="w-full max-w-5xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Admin</p>
          <h1 className="text-5xl text-gray-900 leading-none">Member documents</h1>
          <p className="mt-2 text-gray-600">{documents.length} files on file · {missingW9.length} member{missingW9.length === 1 ? "" : "s"} without a W-9</p>
        </div>
        <div className="flex gap-2">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className={`${inputClass} w-auto py-2 text-sm`} aria-label="Filter by type">
            <option value="">All types</option>
            {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, member, business…" className={`${inputClass} w-64 py-2 text-sm`} />
        </div>
      </header>

      {missingW9.length > 0 && (
        <details className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <summary className="cursor-pointer font-semibold">Members without a W-9 ({missingW9.length})</summary>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {missingW9.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <span>{m.name} <span className="text-amber-700">· {m.email}</span></span>
                <button type="button" onClick={() => setUploadFor(m)} className="text-xs font-semibold text-[#910000] hover:underline">Upload for them</button>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="mb-6">
        {uploadFor ? (
          <div className="space-y-3">
            <DocumentUploadForm kinds={kinds} businesses={[]} ownerId={uploadFor.id} ownerName={uploadFor.name} />
            <button type="button" onClick={() => setUploadFor(null)} className={ghostButtonClass}>Done</button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <select
              defaultValue=""
              onChange={(e) => { const m = members.find((x) => x.id === Number(e.target.value)); if (m) setUploadFor(m); }}
              className={`${inputClass} w-auto py-2 text-sm`}
              aria-label="Upload on behalf of a member"
            >
              <option value="" disabled>Upload on behalf of…</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.email}</option>)}
            </select>
            <span className={`${secondaryButtonClass} pointer-events-none py-2 text-sm opacity-0`} aria-hidden>spacer</span>
          </div>
        )}
      </div>

      <DocumentList documents={shown} showOwner />
    </div>
  );
}

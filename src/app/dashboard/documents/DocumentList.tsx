"use client";

import { useState, useTransition } from "react";
import { deleteDocument, type DocumentWithMeta } from "./actions";

const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
function size(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  documents: DocumentWithMeta[];
  /** Show owner column (admin view). */
  showOwner?: boolean;
  canDelete?: boolean;
}

export default function DocumentList({ documents, showOwner, canDelete = true }: Props) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  if (documents.length === 0) {
    return <p className="text-gray-600">No documents yet.</p>;
  }

  return (
    <div className="hth-card overflow-hidden">
      {msg && <p className="border-b border-gray-100 px-5 py-2 text-sm text-gray-600">{msg}</p>}
      <ul className="divide-y divide-gray-100">
        {documents.map((d) => (
          <li key={d.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#2b2b2b] text-xs font-bold uppercase text-white">
              {d.fileName.split(".").pop()?.slice(0, 4) ?? "file"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">{d.title}</p>
              <p className="truncate text-sm text-gray-600">
                {d.kind} · {size(d.sizeBytes)} · {date.format(new Date(d.createdAt))}
                {d.business ? ` · ${d.business.businessName}` : ""}
                {showOwner ? ` · ${d.owner.name}` : ""}
              </p>
              {d.notes && <p className="mt-0.5 text-sm text-gray-500">{d.notes}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <a href={`/api/documents/${d.id}`} target="_blank" rel="noopener" className="rounded-lg border-2 border-[#910000] px-3 py-1.5 text-sm font-semibold text-[#910000] hover:bg-[#910000] hover:text-white">
                View
              </a>
              <a href={`/api/documents/${d.id}?download=1`} className="rounded-lg border-2 border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-gray-400">
                Download
              </a>
              {canDelete && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm(`Delete "${d.title}"? This can't be undone.`)) return;
                    start(async () => {
                      const r = await deleteDocument(d.id);
                      setMsg(r.error || r.message);
                    });
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

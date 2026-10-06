import type { CourseAttachment } from "@/db/schema";

function size(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Download list for course/lesson materials (templates, worksheets, slides). */
export default function AttachmentList({ attachments, title = "Downloads & templates" }: { attachments: CourseAttachment[]; title?: string }) {
  if (attachments.length === 0) return null;
  return (
    <section className="mt-6 hth-card p-6 lg:p-8 hth-fade-up hth-fade-up-delay-1">
      <h2 className="text-3xl text-gray-900 mb-3">{title}</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {attachments.map((a) => (
          <li key={a.id}>
            <a href={a.url} target="_blank" rel="noopener noreferrer" download={a.fileName} className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 transition hover:border-[#910000] hover:text-[#910000]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#2b2b2b] text-[10px] font-bold uppercase text-white">
                {a.fileName.split(".").pop()?.slice(0, 4) ?? "file"}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{a.title}</span>
                <span className="block text-xs text-gray-500">{a.fileName} · {size(a.sizeBytes)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

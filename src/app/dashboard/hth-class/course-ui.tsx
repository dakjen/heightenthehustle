import type { Class } from "@/db/schema";

/** Small presentational pieces shared by the member-facing course pages. */

export function typeLabel(type: Class["type"]): string {
  return type === "pre-course" ? "Pre-course" : "HTH course";
}

export function percent(done: number, total: number): number {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function TypeChip({ type, dark = false }: { type: Class["type"]; dark?: boolean }) {
  const cls = dark
    ? "border-white/20 bg-white/10 text-white"
    : type === "pre-course"
      ? "border-gray-200 bg-gray-50 text-gray-700"
      : "border-[#910000]/20 bg-[#910000]/5 text-[#910000]";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em] ${cls}`}>
      {typeLabel(type)}
    </span>
  );
}

export function ProgressBar({ value, dark = false, className = "" }: { value: number; dark?: boolean; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-2 w-full overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-gray-100"} ${className}`}
    >
      <div className={`h-full rounded-full transition-all ${dark ? "bg-[#ff5c5c]" : "bg-[#910000]"}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function formatDuration(minutes: number | null): string | null {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

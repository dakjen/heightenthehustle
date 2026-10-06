import type { Class } from "@/db/schema";
import type { MemberAssignment } from "./assignment-actions";

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

// ---------------------------------------------------------------------------
// Homework / assignment status
// ---------------------------------------------------------------------------

export type AssignmentState = "none" | "overdue" | "submitted" | "graded" | "returned";

export function assignmentState(a: MemberAssignment, now: Date = new Date()): AssignmentState {
  const s = a.submission;
  if (!s) return a.dueDate && new Date(a.dueDate).getTime() < now.getTime() ? "overdue" : "none";
  if (s.status === "graded") return "graded";
  if (s.status === "returned") return "returned";
  return "submitted";
}

export function formatShortDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function scoreLabel(a: MemberAssignment): string | null {
  const s = a.submission;
  if (!s || s.score == null) return null;
  return a.points ? `${s.score} / ${a.points}` : `${s.score}`;
}

const chipBase = "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap";

/** Status chip for an assignment: Not submitted / Overdue / Submitted / Graded x/y / Revision requested. */
export function AssignmentStatusChip({ assignment, className = "" }: { assignment: MemberAssignment; className?: string }) {
  const state = assignmentState(assignment);
  const sub = assignment.submission;
  switch (state) {
    case "overdue":
      return <span className={`${chipBase} border-red-200 bg-red-50 text-red-700 ${className}`}>Overdue</span>;
    case "submitted":
      return (
        <span className={`${chipBase} border-green-200 bg-green-50 text-green-800 ${className}`}>
          Submitted{sub ? ` ${formatShortDate(sub.submittedAt)}` : ""}
        </span>
      );
    case "graded": {
      const score = scoreLabel(assignment);
      return <span className={`${chipBase} border-[#910000]/20 bg-[#910000]/5 text-[#910000] ${className}`}>Graded{score ? ` ${score}` : ""}</span>;
    }
    case "returned":
      return <span className={`${chipBase} border-amber-200 bg-amber-50 text-amber-800 ${className}`}>Revision requested</span>;
    default:
      return <span className={`${chipBase} border-gray-200 bg-gray-50 text-gray-600 ${className}`}>Not submitted</span>;
  }
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAllUserBusinesses } from "../businesses/actions";
import { getFeaturedCohort, getMyWaitlistEntry } from "./cohort-actions";
import { getMyCourses, type MemberCourse } from "./course-actions";
import { ProgressBar, TypeChip, percent } from "./course-ui";
import WaitlistForm from "./WaitlistForm";
import { FormSuccess } from "@/app/components/form";

export const dynamic = "force-dynamic";

const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });
const monthOnly = new Intl.DateTimeFormat("en-US", { month: "long" });

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const ms = date.getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 86_400_000) : null;
}

function CourseCard({ course }: { course: MemberCourse }) {
  const total = course.lessons.length;
  const pct = percent(course.completedCount, total);
  const nextLesson = course.lessons.find((l) => !l.completed) ?? null;
  const finished = total > 0 && course.completedCount === total;
  const cohortName = course.enrollment.cohort?.name ?? null;

  return (
    <section className="hth-card p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TypeChip type={course.type} />
            {cohortName && <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">{cohortName}</span>}
          </div>
          <h3 className="mt-2 text-3xl leading-none text-gray-900">
            <Link href={`/dashboard/hth-class/${course.id}`} className="hover:text-[#910000]">{course.title}</Link>
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {total === 0
              ? "Lessons are on the way."
              : finished
                ? "You've completed every lesson. Nice work."
                : `${course.completedCount} of ${total} lesson${total === 1 ? "" : "s"} done`}
          </p>
        </div>
        <p className="font-display text-4xl leading-none text-[#910000] sm:text-right">{pct}%</p>
      </div>
      <ProgressBar value={pct} className="mt-4" />
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        {nextLesson ? (
          <Link
            href={`/dashboard/hth-class/${course.id}/${nextLesson.id}`}
            className="inline-flex items-center justify-center rounded-lg bg-[#910000] px-5 py-3 font-semibold text-white shadow-md transition-all hover:bg-[#7a0000] hover:shadow-lg"
          >
            {course.completedCount > 0 ? "Continue" : "Start"}: Unit {nextLesson.order}
            <span className="ml-2 hidden max-w-[16rem] truncate font-normal text-white/80 sm:inline">· {nextLesson.title}</span>
          </Link>
        ) : null}
        <Link href={`/dashboard/hth-class/${course.id}`} className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 px-5 py-2.5 font-semibold text-gray-700 transition hover:border-gray-400">
          All lessons
        </Link>
      </div>
    </section>
  );
}

export default async function HTHClassPage() {
  const user = await requireUser();
  if (user.role !== "external") redirect("/dashboard/admin/hth-class/cohorts"); // members only
  const [cohort, businesses, courses] = await Promise.all([getFeaturedCohort(), getAllUserBusinesses(user.id), getMyCourses()]);
  const entry = cohort ? await getMyWaitlistEntry(cohort.id) : null;
  const days = daysUntil(cohort?.startDate ?? null);
  const startLabel = cohort?.startDate ? longDate.format(cohort.startDate) : "January";
  const monthLabel = cohort?.startDate ? monthOnly.format(cohort.startDate) : "January";
  const enrolled = courses.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Your courses (enrolled members only) */}
      {enrolled && (
        <div className="hth-fade-up">
          <header className="mb-4">
            <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">HTH Curriculum</p>
            <h1 className="text-5xl leading-none text-gray-900">Your courses</h1>
            <p className="mt-2 text-gray-600">Pick up where you left off.</p>
          </header>
          <div className="space-y-6">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </div>
      )}

      {/* Announcement */}
      {enrolled ? (
        <section className="mt-8 relative overflow-hidden rounded-2xl bg-[#2b2b2b] hth-stripes text-white p-6 lg:p-8 hth-fade-up hth-fade-up-delay-1">
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#910000] opacity-50 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[#ff8a8a] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Next cohort</p>
              <h2 className="text-3xl leading-none">
                Opens in <span className="text-[#ff5c5c]">{monthLabel}.</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm text-gray-300">
                {cohort?.description ??
                  "A hands-on business curriculum built for hustlers: funding readiness, operations, marketing and pitching, taught live with your cohort."}
              </p>
            </div>
            <div className="flex gap-6 shrink-0">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Starts</p>
                <p className="font-display text-2xl leading-none">{startLabel}</p>
              </div>
              {days !== null && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Countdown</p>
                  <p className="font-display text-2xl leading-none">{days} days</p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-2xl bg-[#2b2b2b] hth-stripes text-white p-8 lg:p-12 hth-fade-up">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#910000] opacity-50 blur-3xl" />
          <div className="relative">
            <p className="text-[#ff8a8a] uppercase tracking-[0.3em] text-xs font-semibold mb-3">HTH Curriculum</p>
            <h1 className="text-5xl lg:text-7xl leading-none">
              Our next cohort opens in <span className="text-[#ff5c5c]">{monthLabel}.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-gray-300">
              {cohort?.description ??
                "A hands-on business curriculum built for hustlers: funding readiness, operations, marketing and pitching, taught live with your cohort."}
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Starts</p>
                <p className="font-display text-3xl leading-none">{startLabel}</p>
              </div>
              {days !== null && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Countdown</p>
                  <p className="font-display text-3xl leading-none">{days} days</p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Format</p>
                <p className="font-display text-3xl leading-none">Live + online</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Waitlist */}
      <section className="mt-6 hth-card p-8 hth-fade-up hth-fade-up-delay-1">
        {!cohort ? (
          <>
            <h2 className="text-3xl text-gray-900 mb-2">Waitlist opening soon</h2>
            <p className="text-gray-700">We&apos;re finalizing the schedule. Check back shortly to reserve your spot.</p>
          </>
        ) : entry ? (
          <>
            <h2 className="text-3xl text-gray-900 mb-2">You&apos;re on the list</h2>
            <FormSuccess message={`You joined the ${cohort.name} waitlist on ${longDate.format(entry.createdAt)}. We'll email ${entry.email} when enrollment opens.`} />
          </>
        ) : (
          <>
            <h2 className="text-3xl text-gray-900 mb-1">Reserve your spot</h2>
            <p className="mb-6 text-gray-700">
              Join the {cohort.name} waitlist and you&apos;ll be first to hear when enrollment opens. Spots are limited.
            </p>
            <WaitlistForm
              cohortId={cohort.id}
              cohortName={cohort.name}
              defaultName={user.name}
              defaultEmail={user.email}
              defaultPhone={user.phone}
              defaultBusinessName={businesses[0]?.businessName ?? ""}
            />
          </>
        )}
      </section>

      {/* What to expect */}
      <div className="mt-6 grid gap-6 md:grid-cols-3 hth-fade-up hth-fade-up-delay-2">
        {[
          ["01", "Pre-course", "Short prep modules so everyone starts the cohort on the same footing."],
          ["02", "HTH course", "Weekly live sessions with your cohort plus assignments you apply to your own business."],
          ["03", "Beyond", "Pitch practice, funding introductions and a network that keeps going after graduation."],
        ].map(([n, title, body]) => (
          <section key={n} className="hth-card p-7">
            <p className="text-4xl text-[#910000] leading-none mb-3">{n}</p>
            <h2 className="text-2xl text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-700">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

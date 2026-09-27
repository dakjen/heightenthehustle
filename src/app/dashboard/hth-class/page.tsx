import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAllUserBusinesses } from "../businesses/actions";
import { getFeaturedCohort, getMyWaitlistEntry } from "./cohort-actions";
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

export default async function HTHClassPage() {
  const user = await requireUser();
  if (user.role !== "external") redirect("/dashboard/admin/hth-class/cohorts"); // members only
  const [cohort, businesses] = await Promise.all([getFeaturedCohort(), getAllUserBusinesses(user.id)]);
  const entry = cohort ? await getMyWaitlistEntry(cohort.id) : null;
  const days = daysUntil(cohort?.startDate ?? null);
  const startLabel = cohort?.startDate ? longDate.format(cohort.startDate) : "January";
  const monthLabel = cohort?.startDate ? monthOnly.format(cohort.startDate) : "January";

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Announcement */}
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

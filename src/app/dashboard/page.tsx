import Link from "next/link";
import { count, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { businesses, clientIntakeForms, cohortWaitlist, users, cohorts, supportRequests, documents } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import WelcomeModal from "@/app/components/WelcomeModal";
import { getFeaturedCohort } from "./hth-class/cohort-actions";

export const dynamic = "force-dynamic";

/** A count query that returns 0 instead of crashing the page if the table isn't there yet. */
async function safeCount(q: Promise<{ n: number }[]>): Promise<number> {
  try {
    return (await q)[0]?.n ?? 0;
  } catch (error) {
    console.error("count failed:", error);
    return 0;
  }
}

type Step = { key: string; title: string; body: string; href: string; cta: string; done: boolean };

function Checklist({ steps }: { steps: Step[] }) {
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);
  return (
    <section className="hth-card p-8 hth-fade-up hth-fade-up-delay-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl text-gray-900">Get set up</h2>
          <p className="text-gray-600">{done === steps.length ? "You're all set. Nice work." : `${done} of ${steps.length} done. Finish these to unlock everything HTH offers.`}</p>
        </div>
        <p className="font-display text-4xl leading-none text-[#910000]">{pct}%</p>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-[#910000] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ol className="mt-6 divide-y divide-gray-100">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-4 py-4">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.done ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"}`}>
              {s.done ? "✓" : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold ${s.done ? "text-gray-500 line-through" : "text-gray-900"}`}>{s.title}</p>
              <p className="text-sm text-gray-600">{s.body}</p>
            </div>
            {!s.done && (
              <Link href={s.href} className="shrink-0 rounded-lg bg-[#910000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7a0000]">
                {s.cta}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

async function MemberHome({ userId, name }: { userId: number; name: string }) {
  const [biz, intake, cohort, me] = await Promise.all([
    db.select({ n: count() }).from(businesses).where(eq(businesses.userId, userId)),
    db.select({ n: count() }).from(clientIntakeForms).where(eq(clientIntakeForms.userId, userId)),
    getFeaturedCohort(),
    db.query.users.findFirst({ where: eq(users.id, userId), columns: { personalCity: true, personalState: true, profilePhotoUrl: true, phone: true } }),
  ]);
  const onWaitlist = cohort
    ? (await safeCount(db.select({ n: count() }).from(cohortWaitlist).where(and(eq(cohortWaitlist.cohortId, cohort.id), eq(cohortWaitlist.userId, userId))))) > 0
    : false;
  const profileDone = Boolean(me?.phone && (me.personalCity || me.profilePhotoUrl));
  const hasW9 = (await safeCount(db.select({ n: count() }).from(documents).where(and(eq(documents.ownerId, userId), eq(documents.kind, "W-9"))))) > 0;

  const steps: Step[] = [
    { key: "intake", title: "Complete your intake form", body: "Tell us where your business is and what you need. Takes about 5 minutes.", href: "/dashboard/intake-form", cta: "Start", done: intake[0].n > 0 },
    { key: "business", title: "Add your business", body: "Your business profile powers grant matching and messaging.", href: "/dashboard/businesses", cta: "Add", done: biz[0].n > 0 },
    { key: "profile", title: "Finish your profile", body: "Add a photo and your city so the team can reach you.", href: "/dashboard/profile", cta: "Edit", done: profileDone },
    { key: "waitlist", title: cohort ? `Join the ${cohort.name} waitlist` : "Join the curriculum waitlist", body: "Our next cohort is coming. Reserve your spot early.", href: "/dashboard/hth-class", cta: "Join", done: onWaitlist },
    { key: "w9", title: "Upload your W-9", body: "Required before we can send any funding or prize money. Stored privately.", href: "/dashboard/documents", cta: "Upload", done: hasW9 },
  ];

  const first = name.split(" ")[0] || "there";
  return (
    <div className="w-full max-w-5xl mx-auto">
      <WelcomeModal />
      <section className="relative overflow-hidden rounded-2xl bg-[#2b2b2b] hth-stripes text-white p-8 lg:p-12 hth-fade-up">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#910000] opacity-50 blur-3xl" />
        <div className="relative">
          <p className="text-[#ff8a8a] uppercase tracking-[0.3em] text-xs font-semibold mb-3">Welcome back, {first}</p>
          <h1 className="text-5xl lg:text-7xl leading-none">
            Elevate your hustle into a <span className="text-[#ff5c5c]">thriving business.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-gray-300">
            Funding, tools, classes and a community built to take your business to the next level.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard/hth-class" className="inline-flex justify-center px-6 py-3 bg-[#910000] text-white font-semibold rounded-lg shadow-md hover:bg-[#7a0000] hover:shadow-lg transition-all">
              {cohort ? `Curriculum cohort: ${cohort.name}` : "Curriculum coming soon"}
            </Link>
            <Link href="/dashboard/support" className="inline-flex justify-center px-6 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all">
              Request specialized support
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <Checklist steps={steps} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3 hth-fade-up hth-fade-up-delay-2">
        {[
          ["01", "How we help", "Funding introductions, a live curriculum, pitch competitions and a network of entrepreneurs who've been where you are."],
          ["02", "Our resources", "Grants and capital, business tools for forms and regulations, and mentors who answer the phone."],
          ["03", "Stay in touch", "We send resources and alerts periodically. Manage that any time in Settings."],
        ].map(([n, t, b]) => (
          <section key={n} className="hth-card p-7">
            <p className="text-4xl text-[#910000] leading-none mb-3">{n}</p>
            <h2 className="text-2xl text-gray-900 mb-2">{t}</h2>
            <p className="text-gray-700">{b}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

async function AdminHome({ name, role }: { name: string; role: string }) {
  const [pending, members, intakes, waitlist, openCohorts, openSupport] = await Promise.all([
    safeCount(db.select({ n: count() }).from(users).where(eq(users.status, "pending"))),
    safeCount(db.select({ n: count() }).from(users).where(and(eq(users.role, "external"), eq(users.status, "approved")))),
    safeCount(db.select({ n: count() }).from(clientIntakeForms).where(eq(clientIntakeForms.status, "submitted"))),
    safeCount(db.select({ n: count() }).from(cohortWaitlist)),
    safeCount(db.select({ n: count() }).from(cohorts).where(eq(cohorts.isWaitlistOpen, true))),
    safeCount(db.select({ n: count() }).from(supportRequests).where(eq(supportRequests.status, "open"))),
  ]);

  const tiles = [
    { label: "Account requests", value: pending, href: "/dashboard/admin/users", hint: "waiting for approval" },
    { label: "Active members", value: members, href: "/dashboard/admin/users", hint: "approved accounts" },
    { label: "Intake forms", value: intakes, href: "/dashboard/admin/intake-forms", hint: "not yet reviewed" },
    { label: "On the waitlist", value: waitlist, href: "/dashboard/admin/hth-class/cohorts", hint: `${openCohorts} cohort${openCohorts === 1 ? "" : "s"} open` },
    { label: "Support requests", value: openSupport, href: "/dashboard/admin/support", hint: "open, need a reply" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <header className="mb-6 hth-fade-up">
        <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">{role === "admin" ? "Admin" : "Team"} dashboard</p>
        <h1 className="text-5xl text-gray-900 leading-none">Hey, {name.split(" ")[0]}.</h1>
        <p className="mt-2 text-gray-600">Here&apos;s what needs your attention.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 hth-fade-up hth-fade-up-delay-1">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="hth-card p-6 transition hover:shadow-lg">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{t.label}</p>
            <p className="mt-2 font-display text-5xl leading-none text-[#910000]">{t.value}</p>
            <p className="mt-1 text-sm text-gray-600">{t.hint}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2 hth-fade-up hth-fade-up-delay-2">
        <section className="hth-card p-7">
          <h2 className="text-2xl text-gray-900 mb-3">Quick actions</h2>
          <ul className="space-y-2 text-[#910000] font-semibold">
            <li><Link href="/dashboard/admin/users" className="hover:underline">Review account requests →</Link></li>
            <li><Link href="/dashboard/admin/support" className="hover:underline">Answer support requests →</Link></li>
            <li><Link href="/dashboard/admin/hth-class/cohorts" className="hover:underline">Create a cohort / view waitlist →</Link></li>
            <li><Link href="/dashboard/messages" className="hover:underline">Send a mass message →</Link></li>
            <li><Link href="/dashboard/admin/businesses/manage" className="hover:underline">Browse member businesses →</Link></li>
            <li><Link href="/dashboard/admin/documents" className="hover:underline">Member documents (W-9s, decks) →</Link></li>
            <li><Link href="/dashboard/admin/resources" className="hover:underline">Manage the resources hub →</Link></li>
          </ul>
        </section>
        <section className="hth-card p-7">
          <h2 className="text-2xl text-gray-900 mb-3">Onboarding flow</h2>
          <ol className="list-decimal space-y-1 pl-5 text-gray-700 text-sm">
            <li>Member requests an account and gets a &quot;we&apos;ll reply within 48 hours&quot; email.</li>
            <li>You approve them here. They get a welcome email with a sign-in link.</li>
            <li>Their first sign-in lands on the intake form, then the home checklist.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "external") return <MemberHome userId={user.id} name={user.name} />;
  return <AdminHome name={user.name} role={user.role} />;
}

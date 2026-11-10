import { getSession } from "@/app/login/actions";
import { redirect } from "next/navigation";
import OptOutForm from "./OptOutForm";
import ChangePasswordForm from "./ChangePasswordForm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch the latest user data to get the most up-to-date isOptedOut status
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="mb-8 hth-fade-up">
        <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Your Account</p>
        <h1 className="text-5xl text-gray-900 leading-none">Settings</h1>
        <p className="mt-3 text-lg text-gray-600">Change your password and choose what we send you.</p>
      </header>

      <div className="space-y-6 hth-fade-up hth-fade-up-delay-1">
        <section>
          <h2 className="mb-3 text-2xl text-gray-900">Password</h2>
          <ChangePasswordForm />
        </section>

        <section className="hth-card p-6">
          <h2 className="mb-1 text-2xl text-gray-900">Communication preferences</h2>
          <p className="mb-4 text-sm text-gray-600">Funding alerts, resources and pitch announcements from the HTH team.</p>
          <OptOutForm userName={currentUser.name} isOptedOut={currentUser.isOptedOut} />
        </section>
      </div>
    </div>
  );
}

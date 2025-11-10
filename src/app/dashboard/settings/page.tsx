import { getSession } from "@/app/login/actions";
import { redirect } from "next/navigation";
import OptOutForm from "./OptOutForm";
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
    <div>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Communication Preferences</h2>
          <OptOutForm userName={currentUser.name} isOptedOut={currentUser.isOptedOut} />
        </div>
        
        {/* Other settings can be added here in the future */}
      </div>
    </div>
  );
}

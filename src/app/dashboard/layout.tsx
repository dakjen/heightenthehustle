import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import SidebarUserMenu from "@/app/components/SidebarUserMenu";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import SidebarNav, { type NavItem } from "@/app/components/SidebarNav";
import Image from "next/image";
import Link from "next/link";
import { getAllUserBusinesses } from "./businesses/actions";
import { getUnreadCount } from "./messages/actions";
// import AdminViewToggle from "./components/AdminViewToggle"; // New import
// import { headers, cookies } from "next/headers"; // New import for searchParams and cookies

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/login");
  }

  const businesses = await getAllUserBusinesses(session.user.id); // Fetch businesses
  const unreadMessages = await getUnreadCount();
  const isAdmin = session.user.role === 'admin';
  const isExternal = session.user.role === 'external';
  const canAccessAdminUsers = isAdmin || (session.user.role === 'internal' && session.user.canApproveRequests);
  const canAccessAdminClasses = isAdmin || (session.user.role === 'internal' && session.user.canManageClasses);
  const canAccessAdminBusinesses = isAdmin || (session.user.role === 'internal' && session.user.canManageBusinesses);
  // Anyone who is staff (admin, or a team member with any admin permission). Members never see admin tools.
  const isAdminArea = isAdmin || (session.user.role === 'internal' && (canAccessAdminUsers || canAccessAdminClasses || canAccessAdminBusinesses));

  // Same links and visibility rules as before, just built as data so the
  // client-side nav can highlight the current page.
  const items: NavItem[] = [
    { href: "/dashboard", label: "Home" },
    ...(isExternal ? [{ href: "/dashboard/intake-form", label: "Client Intake Form" }] : []),
    ...(isExternal ? [{ href: "/dashboard/businesses", label: "Businesses" }] : []),
    ...(isExternal
      ? businesses.map((b) => ({ href: `/dashboard/businesses/${b.id}`, label: b.businessName, sub: true }))
      : []),
    { href: "/dashboard/messages", label: "Messages", badge: unreadMessages },
    ...(isExternal ? [{ href: "/dashboard/support", label: "Get Support" }] : []),
    ...(isExternal ? [{ href: "/dashboard/documents", label: "My Documents" }] : []),
    ...(isExternal ? [{ href: "/dashboard/hth-class", label: "HTH Class" }] : []),
    { href: "/dashboard/resources", label: "Resources" },
  ];

  const adminItems: NavItem[] = [
    ...(canAccessAdminUsers ? [{ href: "/dashboard/admin/users", label: "Admin Users" }] : []),
    ...(isAdminArea ? [{ href: "/dashboard/admin/support", label: "Support Requests" }] : []),
    ...(isAdminArea ? [{ href: "/dashboard/admin/documents", label: "Member Documents" }] : []),
    ...(isAdminArea ? [{ href: "/dashboard/admin/resources", label: "Manage Resources" }] : []),
    ...(canAccessAdminBusinesses ? [{ href: "/dashboard/admin/businesses/manage", label: "Admin Businesses" }] : []),
    ...(isAdmin ? [{ href: "/dashboard/admin/intake-forms", label: "Admin Intake Forms" }] : []),
    ...(isAdmin ? [{ href: "/dashboard/admin/pitch-competition", label: "Admin Pitch Competition" }] : []),
    ...(canAccessAdminClasses ? [{ href: "/dashboard/admin/hth-class/cohorts", label: "Cohorts & Waitlist" }] : []),
    ...(canAccessAdminClasses ? [{ href: "/dashboard/admin/hth-class", label: "Admin HTH Class" }] : []),
  ];

  const roleLabel = isAdmin ? "Admin" : session.user.role === 'internal' ? "Team" : "Member";
  // The session cookie can be stale after a photo change, so read the current headshot.
  const me = await db.query.users.findFirst({ where: eq(users.id, session.user.id), columns: { profilePhotoUrl: true } });
  const profilePhotoUrl = me?.profilePhotoUrl ?? session.user.profilePhotoUrl ?? null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f6]">
      {/* Sidebar */}
      <aside className="h-full w-64 shrink-0 bg-[#2b2b2b] text-white flex flex-col">
        <div className="hth-accent-bar rounded-none" />
        <div className="p-5 pb-4 border-b border-white/10">
          <Link href="/" className="block">
            <Image src="/hthlogo.svg" alt="Heighten The Hustle" width={180} height={180} priority />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNav items={items} adminItems={adminItems} />
        </div>

        {/* Admin View Toggle */}
        {/* <AdminViewToggle isAdmin={isAdmin} /> */}

        <div className="p-3 border-t border-white/10">
          <SidebarUserMenu name={session.user.name || session.user.email} roleLabel={roleLabel} photoUrl={profilePhotoUrl} />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden flex flex-col text-gray-900 p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}

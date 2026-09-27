import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import LogoutButton from "@/app/components/LogoutButton";
import SidebarNav, { type NavItem } from "@/app/components/SidebarNav";
import Image from "next/image";
import Link from "next/link";
import { getAllUserBusinesses } from "./businesses/actions";
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
  const isAdmin = session.user.role === 'admin';
  const isExternal = session.user.role === 'external';
  const canAccessAdminUsers = isAdmin || (session.user.role === 'internal' && session.user.canApproveRequests);
  const canAccessAdminClasses = isAdmin || (session.user.role === 'internal' && session.user.canManageClasses);
  const canAccessAdminBusinesses = isAdmin || (session.user.role === 'internal' && session.user.canManageBusinesses);

  // Same links and visibility rules as before, just built as data so the
  // client-side nav can highlight the current page.
  const items: NavItem[] = [
    { href: "/dashboard", label: "Home" },
    ...(isExternal ? [{ href: "/dashboard/intake-form", label: "Client Intake Form" }] : []),
    ...(isExternal ? [{ href: "/dashboard/businesses", label: "Businesses" }] : []),
    ...(isExternal
      ? businesses.map((b) => ({ href: `/dashboard/businesses/${b.id}`, label: b.businessName, sub: true }))
      : []),
    { href: "/dashboard/messages", label: "Messages" },
    ...(isExternal ? [{ href: "/dashboard/support", label: "Get Support" }] : []),
    ...(isExternal ? [{ href: "/dashboard/hth-class", label: "HTH Class" }] : []),
    ...(session.user.role === 'internal' ? [{ href: "/dashboard/resources", label: "Resources" }] : []),
    { href: "/dashboard/settings", label: "Settings" },
    { href: "/dashboard/profile", label: "Profile" },
  ];

  const adminItems: NavItem[] = [
    ...(canAccessAdminUsers ? [{ href: "/dashboard/admin/users", label: "Admin Users" }] : []),
    { href: "/dashboard/admin/support", label: "Support Requests" },
    ...(canAccessAdminBusinesses ? [{ href: "/dashboard/admin/businesses/manage", label: "Admin Businesses" }] : []),
    ...(isAdmin ? [{ href: "/dashboard/admin/intake-forms", label: "Admin Intake Forms" }] : []),
    ...(isAdmin ? [{ href: "/dashboard/admin/pitch-competition", label: "Admin Pitch Competition" }] : []),
    ...(canAccessAdminClasses ? [{ href: "/dashboard/admin/hth-class/cohorts", label: "Cohorts & Waitlist" }] : []),
    ...(canAccessAdminClasses ? [{ href: "/dashboard/admin/hth-class", label: "Admin HTH Class" }] : []),
  ];

  const roleLabel = isAdmin ? "Admin" : session.user.role === 'internal' ? "Team" : "Member";

  return (
    <div className="flex min-h-screen bg-[#f6f6f6]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#2b2b2b] text-white flex flex-col">
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

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 pb-3">
            <div className="h-9 w-9 rounded-full bg-[#910000] flex items-center justify-center font-display text-lg leading-none">
              {(session.user.name || session.user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name || session.user.email}</p>
              <p className="text-xs text-gray-400">{roleLabel}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col text-gray-900 p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}

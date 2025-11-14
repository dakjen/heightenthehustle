import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import LogoutButton from "@/app/components/LogoutButton";
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
  const canAccessAdminUsers = isAdmin || (session.user.role === 'internal' && session.user.canApproveRequests);
  // Add other permission checks here for other admin tools as needed

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#606060] text-white p-4 space-y-6">
        <Link href="/">
          <Image src="/hthlogo.svg" alt="Logo" width={180} height={180} className="mb-6" />
        </Link>

        <nav>
          <Link href="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Home</Link>
          {session.user.role === 'external' && ( // Show Businesses link only for external users
            <Link href="/dashboard/businesses" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Businesses</Link>
          )}
          {/* Render sublinks for businesses */}
          {session.user.role === 'external' && businesses.map((business) => ( // Show sublinks only for external users
            <Link key={business.id} href={`/dashboard/businesses/${business.id}`} className="block py-2 px-6 text-sm rounded transition duration-200 hover:bg-[#4a4a4a]">
              {business.businessName}
            </Link>
          ))}
          {/* <Link href="/dashboard/heighten-ai" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Heighten.Ai</Link> */}
          <Link href="#" className="block py-2.5 px-4 rounded transition duration-200 text-gray-400">Messages <span className="text-xs text-gray-500 ml-2">(Coming Soon)</span></Link>
          {session.user.role === 'internal' && ( // Show Resources link only for internal users
            <Link href="/dashboard/resources" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Resources</Link>
          )}
          <Link href="#" className="block py-2.5 px-4 rounded transition duration-200 text-gray-400">HTH Class <span className="text-xs text-gray-500 ml-2">(Coming Soon)</span></Link>
          <Link href="/dashboard/settings" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Settings</Link>
          <Link href="/dashboard/profile" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Profile</Link>
          {(isAdmin || canAccessAdminUsers) && ( // Show Admin Tools heading if any admin tool is accessible
            <>
              <h2 className="text-lg font-semibold text-gray-400 uppercase mt-6 mb-2">Admin Tools</h2>
              {canAccessAdminUsers && (
                <Link href="/dashboard/admin/users" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Admin Users</Link>
              )}
              {isAdmin && ( // Other admin links remain admin-only for now
                <>
                  <Link href="/dashboard/admin/businesses/manage" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Admin Businesses</Link>
                  <Link href="/dashboard/admin/pitch-competition" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Admin Pitch Competition</Link>
                  <Link href="/dashboard/admin/hth-class" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Admin HTH Class</Link>
                </>
              )}
            </>
          )}
        </nav>

        {/* Admin View Toggle */}
        {/* <AdminViewToggle isAdmin={isAdmin} /> */}

        <LogoutButton />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col text-gray-900 p-6">
        {children}
      </main>
    </div>
  );
}
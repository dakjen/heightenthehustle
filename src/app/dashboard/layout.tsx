import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import LogoutButton from "@/app/components/LogoutButton";
import Image from "next/image";
import Link from "next/link";
import { getAllUserBusinesses } from "./businesses/actions";
import AdminViewToggle from "./components/AdminViewToggle"; // New import
import { headers } from "next/headers"; // New import for searchParams

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

  const headerList = await headers();
  const pathname = headerList.get("x-invoke-path") || "";
  const searchParams = new URLSearchParams(headerList.get("x-invoke-query") || "");
  const isInternalUserView = searchParams.get("viewMode") === "internal";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#606060] text-white p-4 space-y-6">
        <Link href="/">
          <Image src="/hthlogo.svg" alt="Logo" width={180} height={180} className="mb-6" />
        </Link>

        <nav>
          <Link href="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Home</Link>
          {isAdmin && !isInternalUserView && ( // Show Admin Businesses link only for admin view
            <Link href="/dashboard/admin/businesses" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Admin Businesses</Link>
          )}
          {session.user.role === 'external' && ( // Show Businesses link only for external users
            <Link href="/dashboard/businesses" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Businesses</Link>
          )}
          {/* Render sublinks for businesses */}
          {session.user.role === 'external' && businesses.map((business) => ( // Show sublinks only for external users
            <Link key={business.id} href={`/dashboard/businesses/${business.id}`} className="block py-2 px-6 text-sm rounded transition duration-200 hover:bg-[#4a4a4a]">
              {business.businessName}
            </Link>
          ))}
          <Link href="/dashboard/heighten-ai" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Heighten.Ai</Link> {/* New Link */}
          <Link href="/dashboard/messages" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Messages</Link> {/* New Link */}
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Settings</a>
          <Link href="/dashboard/profile" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Profile</Link>
          {isAdmin && !isInternalUserView && ( // Show Admin Users link only for admin view
            <Link href="/dashboard/admin/users" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Admin Users</Link>
          )}
          {/* Add more navigation links here */}
        </nav>

        {/* Admin View Toggle */}
        <AdminViewToggle isAdmin={isAdmin} />

        <LogoutButton />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col text-gray-900">
        {children}
      </main>
    </div>
  );
}

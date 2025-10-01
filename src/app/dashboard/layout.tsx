import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import LogoutButton from "@/app/components/LogoutButton";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#606060] text-white p-4 space-y-6">
        <Link href="/">
          <Image src="/hthlogo.svg" alt="Logo" width={180} height={180} className="mb-6" />
        </Link>

        <nav>
          <Link href="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Home</Link>
          <Link href="/dashboard/businesses" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Businesses</Link>
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Settings</a>
          <Link href="/dashboard/profile" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Profile</Link>
          {session.user && session.user.role === 'admin' && (
            <Link href="/dashboard/admin/users" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Admin Users</Link>
          )}
          {/* Add more navigation links here */}
        </nav>
        <LogoutButton />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col text-gray-900">
        {children}
      </main>
    </div>
  );
}

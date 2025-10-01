import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import LogoutButton from "@/app/components/LogoutButton";
import Image from "next/image";

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
        <Image src="/hthlogo.svg" alt="Logo" width={120} height={120} className="mb-6" />
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <nav>
          <a href="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Home</a>
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Settings</a>
          <a href="/dashboard/profile" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Profile</a>
          {session.user && session.user.role === 'admin' && (
            <a href="/dashboard/admin/users" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#4a4a4a]">Admin Users</a>
          )}
          {/* Add more navigation links here */}
        </nav>
        <LogoutButton />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}

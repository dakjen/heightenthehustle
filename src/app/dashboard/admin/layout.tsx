import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import LogoutButton from "@/app/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  // Check if user is logged in and has admin role
  if (!session || !session.user || session.user.role !== 'admin') {
    redirect("/dashboard"); // Redirect non-admin users to the main dashboard
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#910000] text-white p-4 space-y-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <nav>
          <a href="/dashboard/admin/users" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#7a0000]">User Management</a>
          <a href="/dashboard/admin/businesses" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#7a0000]">Business Management</a>
          {/* Add more admin navigation links here */}
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

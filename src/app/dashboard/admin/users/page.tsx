import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import { createUser, getAllUsers } from "./actions";
import UserManagementClientPage from "./UserManagementClientPage"; // New import for client component
import PermissionsManagementClientPage from "./PermissionsManagementClientPage"; // New import for permissions component
import { headers } from "next/headers"; // New import for searchParams
import Link from "next/link"; // New import for Link component
import { useRouter, useSearchParams } from "next/navigation"; // New import for TabLink
import { useCallback } from "react"; // New import for TabLink

// Define a type for a single user (matching your schema)
interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  password: string; // Note: In a real app, you\'t fetch password to client
  role: 'admin' | 'internal' | 'external';
  hasBusinessProfile: boolean;
  personalAddress: string | null;
  personalCity: string | null;
  personalState: string | null;
  personalZipCode: string | null;
  profilePhotoUrl: string | null;
}

interface UserManagementPageProps {
  searchParams: {
    viewMode?: string;
    tab?: string; // New search param for tabs
  };
}

export default async function UserManagementPage({ searchParams }: UserManagementPageProps) {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    redirect("/dashboard");
  }

  const allUsers = await getAllUsers(); // Fetch users on the server
  const isInternalUserView = searchParams.viewMode === "internal";
  const activeTab = searchParams.tab || "users"; // Default to 'users' tab

  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin User Management</h1>
      <p className="mt-4 text-gray-700">Manage users and their permissions.</p>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabLink href="users" activeTab={activeTab}>Users</TabLink>
          <TabLink href="permissions" activeTab={activeTab}>Permissions</TabLink>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "users" && (
          <UserManagementClientPage initialUsers={allUsers} isInternalUserView={isInternalUserView} />
        )}
        {activeTab === "permissions" && (
          <PermissionsManagementClientPage initialUsers={allUsers} /> // Pass allUsers to permissions page
        )}
      </div>
    </div>
  );
}

// Helper component for Tab Links
function TabLink({ href, activeTab, children }: { href: string; activeTab: string; children: React.ReactNode }) {
  const router = useRouter(); // Use useRouter for client-side navigation
  const searchParams = useSearchParams();

  const createTabQueryString = useCallback(
    (tabName: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabName);
      return params.toString();
    },
    [searchParams]
  );

  const isActive = activeTab === href;

  return (
    <Link
      href={`/dashboard/admin/users?${createTabQueryString(href)}`}
      className={`${
        isActive
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
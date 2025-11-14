import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import { createUser, getAllUsers } from "./actions";
import UserManagementClientPage from "./UserManagementClientPage"; // New import for client component
import PermissionsManagementClientPage from "./PermissionsManagementClientPage"; // New import for permissions component
import UserRequestsClientPage from "./UserRequestsClientPage"; // Import for user requests component
import { headers } from "next/headers"; // New import for searchParams
import TabLink from "./TabLink"; // New import for TabLink
import UserDownloadButton from "./UserDownloadButton";
import BusinessDownloadButton from "./BusinessDownloadButton";

// Define a type for a single user (matching your schema)
interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  password: string; // Note: In a real app, you\'t fetch password to client
  role: 'admin' | 'internal' | 'external';
  status: 'pending' | 'approved' | 'rejected'; // Include status
  hasBusinessProfile: boolean;
  personalAddress: string | null;
  personalCity: string | null;
  personalState: string | null;
  personalZipCode: string | null;
  profilePhotoUrl: string | null;
  canApproveRequests: boolean; // Include new permission
  canMessageAdmins: boolean; // Include new permission
}

export default async function UserManagementPage({ searchParams }: { searchParams: Promise<{ viewMode?: string, tab?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();
  // Allow admin or internal users with canApproveRequests to access
  if (!session || !session.user || (session.user.role !== 'admin' && (session.user.role !== 'internal' || !session.user.canApproveRequests))) {
    redirect("/dashboard");
  }

  const allUsers = await getAllUsers(); // Fetch users on the server
  const isInternalUserView = resolvedSearchParams.viewMode === "internal";
  const activeTab = resolvedSearchParams.tab || "users"; // Default to 'users' tab

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin User Management</h1>
          <p className="mt-4 text-gray-700">Manage users and their permissions.</p>
        </div>
        <div className="flex space-x-2">
          <UserDownloadButton />
          <BusinessDownloadButton />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabLink href="users" activeTab={activeTab}>Users</TabLink>
          <TabLink href="permissions" activeTab={activeTab}>Permissions</TabLink>
          <TabLink href="requests" activeTab={activeTab}>Requests</TabLink>
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
        {activeTab === "requests" && (
          <UserRequestsClientPage />
        )}
      </div>
    </div>
  );
}
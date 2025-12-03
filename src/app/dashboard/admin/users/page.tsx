import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import { getAllUsers } from "./actions";
import UserManagementClientPage from "./UserManagementClientPage"; // New import for client component
import PermissionsManagementClientPage from "./PermissionsManagementClientPage"; // New import for permissions component
import UserRequestsClientPage from "./UserRequestsClientPage"; // Import for user requests component
import TabLink from "./TabLink"; // New import for TabLink
import UserDownloadButton from "./UserDownloadButton";
import BusinessDownloadButton from "./BusinessDownloadButton";

export default async function UserManagementPage({ searchParams }: { searchParams: Promise<{ viewMode?: string, tab?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();
  // Allow admin or internal users with canApproveRequests to access
  if (!session || !session.user || (session.user.role !== 'admin' && (session.user.role !== 'internal' || !session.user.canApproveRequests))) {
    redirect("/dashboard");
  }

  const allUsers = await getAllUsers(); // Fetch users on the server
  const isInternalUserView = resolvedSearchParams.viewMode === "internal"; // Re-introduce this definition
  let activeTab = resolvedSearchParams.tab || "users"; // Default to 'users' tab

  // If internal user with canApproveRequests, force activeTab to 'requests'
  if (session.user.role === 'internal' && session.user.canApproveRequests) {
    activeTab = "requests";
  }

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
          {session.user.role === 'admin' && (
            <>
              <TabLink href="users" activeTab={activeTab}>Users</TabLink>
              <TabLink href="permissions" activeTab={activeTab}>Permissions</TabLink>
            </>
          )}
          {(session.user.role === 'admin' || (session.user.role === 'internal' && session.user.canApproveRequests)) && (
            <TabLink href="requests" activeTab={activeTab}>Requests</TabLink>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {session.user.role === 'admin' && activeTab === "users" && (
          <UserManagementClientPage initialUsers={allUsers} isInternalUserView={isInternalUserView} />
        )}
        {session.user.role === 'admin' && activeTab === "permissions" && (
          <PermissionsManagementClientPage initialUsers={allUsers} /> // Pass allUsers to permissions page
        )}
        {(session.user.role === 'admin' || (session.user.role === 'internal' && session.user.canApproveRequests)) && activeTab === "requests" && (
          <UserRequestsClientPage />
        )}
      </div>
    </div>
  );
}
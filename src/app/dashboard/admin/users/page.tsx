import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import { createUser, getAllUsers } from "./actions";
import UserManagementClientPage from "./UserManagementClientPage"; // New import for client component
import { headers } from "next/headers"; // New import for searchParams

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
  };
}

export default async function UserManagementPage({ searchParams }: UserManagementPageProps) {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    redirect("/dashboard");
  }

  const allUsers = await getAllUsers(); // Fetch users on the server
  const isInternalUserView = searchParams.viewMode === "internal";

  return <UserManagementClientPage initialUsers={allUsers} isInternalUserView={isInternalUserView} />;
}
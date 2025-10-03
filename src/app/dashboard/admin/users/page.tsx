import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import { createUser, getAllUsers } from "./actions";
import UserManagementClientPage from "./UserManagementClientPage"; // New import for client component

// Define a type for a single user (matching your schema)
interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  password: string; // Note: In a real app, you wouldn't fetch password to client
  role: 'admin' | 'internal' | 'external';
  hasBusinessProfile: boolean;
  personalAddress: string | null;
  personalCity: string | null;
  personalState: string | null;
  personalZipCode: string | null;
  profilePhotoUrl: string | null;
}

export default async function UserManagementPage() {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    redirect("/dashboard");
  }

  const allUsers = await getAllUsers(); // Fetch users on the server

  return <UserManagementClientPage initialUsers={allUsers} />;
}
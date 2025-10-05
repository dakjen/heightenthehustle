import { getSession } from "@/app/login/actions";
import { getAllInternalUsers, getMassMessages } from "./actions";
import MessagesClientPage from "./MessagesClientPage";

interface MassMessage {
  id: number;
  adminId: number;
  content: string;
  targetLocationIds: number[] | null;
  targetDemographicIds: number[] | null;
  timestamp: Date;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default async function MessagesPage() {
  const session = await getSession();
  const isAdmin = session?.user?.role === 'admin';

  let initialInternalUsers: User[] = [];
  let initialMassMessages: MassMessage[] = [];

  if (isAdmin) {
    initialInternalUsers = await getAllInternalUsers();
    initialMassMessages = await getMassMessages();
  }

  return (
    <MessagesClientPage
      isAdmin={isAdmin}
      initialInternalUsers={initialInternalUsers}
      initialMassMessages={initialMassMessages}
    />
  );
}
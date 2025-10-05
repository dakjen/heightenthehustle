import { getSession } from "@/app/login/actions";
import { getAllInternalUsers, getMassMessages } from "./server-data";
import MessagesPage from "./page";

export default async function MessagesLayout() {
  const session = await getSession();
  const isAdmin = session?.user?.role === 'admin';

  let initialInternalUsers = [];
  let initialMassMessages = [];

  if (isAdmin) {
    initialInternalUsers = await getAllInternalUsers();
    initialMassMessages = await getMassMessages();
  }

  return (
    <MessagesPage
      isAdmin={isAdmin}
      initialInternalUsers={initialInternalUsers}
      initialMassMessages={initialMassMessages}
    />
  );
}

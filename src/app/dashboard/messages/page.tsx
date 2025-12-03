import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";
import { getAllInternalUsers, getMassMessages, getAvailableLocations, getAvailableDemographics, getIndividualMessages } from "./actions";
import MessagesClientPage from "./MessagesClientPage";
import { Location, Demographic, User, MassMessage } from "@/db/schema";

interface IndividualMessage {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: Date;
  read: boolean;
  replyToMessageId: number | null;
  sender: { id: number; name: string; email: string; };
  recipient: { id: number; name: string; email: string; };
}

interface MessagesPageProps {
  isAdmin: boolean;
  initialInternalUsers: User[];
  initialMassMessages: MassMessage[];
  initialLocations: Location[];
  initialDemographics: Demographic[];
  initialIndividualMessages: IndividualMessage[];
  currentUserId: number | null;
}

export default async function MessagesPage() {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'admin') {
    redirect('/dashboard');
  }
  const isAdmin = session?.user?.role === 'admin';
  const currentUserId = session?.user?.id || null;

  let initialInternalUsers: User[] = [];
  let initialMassMessages: MassMessage[] = [];
  let initialLocations: Location[] = [];
  let initialDemographics: Demographic[] = [];
  let initialIndividualMessages: IndividualMessage[] = [];

  if (isAdmin) {
    initialInternalUsers = await getAllInternalUsers();
    initialMassMessages = await getMassMessages();
    initialLocations = await getAvailableLocations();
    initialDemographics = await getAvailableDemographics();
  }

  if (currentUserId) {
    initialIndividualMessages = await getIndividualMessages(currentUserId);
  }

  console.log("Initial Demographics:", initialDemographics);

  return (
    <MessagesClientPage
      isAdmin={isAdmin}
      initialInternalUsers={initialInternalUsers}
      initialMassMessages={initialMassMessages}
      initialLocations={initialLocations}
      initialDemographics={initialDemographics}
      initialIndividualMessages={initialIndividualMessages}
      currentUserId={currentUserId}
    />
  );
}
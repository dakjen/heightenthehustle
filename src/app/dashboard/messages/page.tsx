import { getSession } from "@/app/login/actions";
import { getAllInternalUsers, getMassMessages, getAvailableLocations, getAvailableDemographics } from "./actions";
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

interface Location {
  id: number;
  name: string;
}

interface Demographic {
  id: number;
  name: string;
}

interface MessagesPageProps {
  isAdmin: boolean;
  initialInternalUsers: User[];
  initialMassMessages: MassMessage[];
  initialLocations: Location[];
  initialDemographics: Demographic[];
  currentUserId: number | null;
}

export default async function MessagesPage() {
  const session = await getSession();
  const isAdmin = session?.user?.role === 'admin';

  let initialInternalUsers: User[] = [];
  let initialMassMessages: MassMessage[] = [];
  let initialLocations: Location[] = [];
  let initialDemographics: Demographic[] = [];

  if (isAdmin) {
    initialInternalUsers = await getAllInternalUsers();
    initialMassMessages = await getMassMessages();
    initialLocations = await getAvailableLocations();
    initialDemographics = await getAvailableDemographics();
  }

  return (
    <MessagesClientPage
      isAdmin={isAdmin}
      initialInternalUsers={initialInternalUsers}
      initialMassMessages={initialMassMessages}
      initialLocations={initialLocations}
      initialDemographics={initialDemographics}
      currentUserId={session?.user?.id || null}
    />
  );
}
import { getPitchCompetitionEntries, getUsers, getBusinesses } from "./actions";
import PitchCompetitionClientPage from "./PitchCompetitionClientPage";

export default async function PitchCompetitionPage() {
  const entries = await getPitchCompetitionEntries();
  const users = await getUsers();
  const businesses = await getBusinesses();

  return (
    <PitchCompetitionClientPage
      initialProjects={entries}
      initialUsers={users}
      initialBusinesses={businesses}
    />
  );
}

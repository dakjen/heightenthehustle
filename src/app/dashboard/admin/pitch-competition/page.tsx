import { getPitchCompetitionEntries } from "./actions";
import PitchCompetitionClientPage from "./PitchCompetitionClientPage";

export default async function PitchCompetitionPage() {
  const entries = await getPitchCompetitionEntries();

  return (
    <PitchCompetitionClientPage
      initialProjects={JSON.stringify(entries)}
    />
  );
}

import { getPitchCompetitionEvents } from "./server-actions";
import PitchCompetitionClientPage from "./PitchCompetitionClientPage";

export default async function PitchCompetitionPage() {
  const events = await getPitchCompetitionEvents();

  return (
    <PitchCompetitionClientPage
      initialEvents={JSON.stringify(events)}
    />
  );
}

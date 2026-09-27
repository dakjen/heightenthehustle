import { getPitchEventOptions } from "@/app/dashboard/intake-form/actions";
import CreateAccountForm from "./CreateAccountForm";

export const dynamic = "force-dynamic";

export default async function CreateAccountPage() {
  const pitchEvents = await getPitchEventOptions();
  return <CreateAccountForm pitchEvents={pitchEvents} />;
}

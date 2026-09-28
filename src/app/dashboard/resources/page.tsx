import { requireUser } from "@/lib/auth";
import { getPublishedResources } from "./actions";
import ResourcesClient from "./ResourcesClient";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  await requireUser();
  const resources = await getPublishedResources();
  return <ResourcesClient resources={resources} />;
}

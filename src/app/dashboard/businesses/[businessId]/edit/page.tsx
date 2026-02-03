import EditBusinessProfileDataFetcher from "./EditBusinessProfileDataFetcher";
import { db } from "@/db";
import { demographics, locations } from "@/db/schema";

interface BusinessEditPageProps {
  params: Promise<{
    businessId: string;
  }>;
}

export default async function Page({ params: paramsPromise }: BusinessEditPageProps) {
  const params = await paramsPromise; // Await the params promise

  const availableDemographics = await db.query.demographics.findMany();
  const availableLocations = await db.query.locations.findMany();

  return (
    <EditBusinessProfileDataFetcher
      businessId={params.businessId}
      availableDemographics={availableDemographics}
      availableLocations={availableLocations}
    />
  );
}
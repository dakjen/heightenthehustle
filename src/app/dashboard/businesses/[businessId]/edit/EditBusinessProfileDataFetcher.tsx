import { notFound } from "next/navigation";
import { getBusinessProfile } from "../../../businesses/actions";
import EditBusinessProfileClientPage from "./EditBusinessProfileClientPage";
import { Demographic, Location } from "@/db/schema";

interface EditBusinessProfileDataFetcherProps {
  businessId: string;
  availableDemographics: Demographic[];
  availableLocations: Location[];
}

export default async function EditBusinessProfileDataFetcher({ businessId, availableDemographics, availableLocations }: EditBusinessProfileDataFetcherProps) {
  const id = parseInt(businessId);

  if (isNaN(id)) {
    notFound();
  }

  const business = await getBusinessProfile(id);

  if (!business) {
    notFound();
  }

  console.log('EditBusinessProfileDataFetcher: availableDemographics', JSON.stringify(availableDemographics, null, 2));
  console.log('EditBusinessProfileDataFetcher: fetched business', JSON.stringify(business, null, 2));

  return (
    <EditBusinessProfileClientPage
      initialBusiness={business}
      availableDemographics={availableDemographics}
      availableLocations={availableLocations}
    />
  );
}

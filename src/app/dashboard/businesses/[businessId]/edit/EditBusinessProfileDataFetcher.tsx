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

  return (
    <EditBusinessProfileClientPage
      initialBusiness={business}
      availableDemographics={availableDemographics}
      availableLocations={availableLocations}
    />
  );
}

import { notFound } from "next/navigation";
import { getBusinessProfile } from "../../../businesses/actions";
import EditBusinessProfileClientPage from "./EditBusinessProfileClientPage";

interface EditBusinessProfileDataFetcherProps {
  businessId: string;
}

export default async function EditBusinessProfileDataFetcher({ businessId }: EditBusinessProfileDataFetcherProps) {
  const id = parseInt(businessId);

  if (isNaN(id)) {
    notFound();
  }

  const business = await getBusinessProfile(id);

  if (!business) {
    notFound();
  }

  return <EditBusinessProfileClientPage initialBusiness={business} />;
}

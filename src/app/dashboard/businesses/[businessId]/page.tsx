import { notFound } from "next/navigation";
import { getBusinessProfile } from "../actions";
import BusinessDetailClientPage from "./BusinessDetailClientPage"; // New import
import { PageProps } from "next"; // New import

export default async function BusinessDetailPage({ params }: PageProps<{ businessId: string }>) {
  const businessId = parseInt(params.businessId);

  if (isNaN(businessId)) {
    notFound();
  }

  const business = await getBusinessProfile(businessId);

  if (!business) {
    notFound();
  }

  return <BusinessDetailClientPage initialBusiness={business} />;
}
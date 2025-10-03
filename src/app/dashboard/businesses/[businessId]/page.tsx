import { notFound } from "next/navigation";
import { getBusinessProfile } from "../actions";
import BusinessDetailClientPage from "./BusinessDetailClientPage"; // New import

interface BusinessDetailPageProps {
  params: { businessId: string };
}

export default async function BusinessDetailPage({ params }: BusinessDetailPageProps) {
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
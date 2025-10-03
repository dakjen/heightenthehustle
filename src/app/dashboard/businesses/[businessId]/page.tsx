import { notFound } from "next/navigation";
import { getBusinessProfile } from "../actions";
import BusinessDetailClientPage from "./BusinessDetailClientPage"; // New import

export default async function BusinessDetailPage({ params }: { params: { businessId: string } & Promise<any> }) {
  console.log('--- BusinessDetailPage loaded for businessId:', params.businessId, '---');
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
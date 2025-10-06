import { notFound } from "next/navigation";
import { getBusinessProfile } from "../actions"; // Import getBusinessProfile
import { BusinessWithDemographic } from "@/db/schema"; // Import BusinessWithDemographic from schema
import { getAvailableDemographics } from "../../messages/actions"; // Import getAvailableDemographics
import BusinessDetailClientPage from "./BusinessDetailClientPage"; // New import

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function BusinessDetailPage({ params }: { params: { businessId: string } & Promise<any> }) {
  console.log('--- BusinessDetailPage loaded for businessId:', params.businessId, '---');
  const businessId = parseInt(params.businessId);

  if (isNaN(businessId)) {
    notFound();
  }

  const business: BusinessWithDemographic | null = await getBusinessProfile(businessId); // Use the new type
  const availableDemographics = await getAvailableDemographics(); // Fetch available demographics

  if (!business) {
    notFound();
  }

  return <BusinessDetailClientPage initialBusiness={business} availableDemographics={availableDemographics} />;
}
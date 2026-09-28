import { notFound } from "next/navigation";
import { getBusinessProfile } from "../actions"; // Import getBusinessProfile
import { BusinessWithLocation } from "@/db/schema";
import { getAvailableDemographics, getAvailableLocations } from "../../messages/actions"; // Import getAvailableDemographics
import BusinessDetailClientPage from "./BusinessDetailClientPage"; // New import

export const dynamic = "force-dynamic";

export default async function BusinessDetailPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId: businessIdParam } = await params;
  const businessId = parseInt(businessIdParam);

  if (isNaN(businessId)) {
    notFound();
  }

  const business: BusinessWithLocation | null = await getBusinessProfile(businessId); // Use the new type
  const availableDemographics = await getAvailableDemographics(); // Fetch available demographics
  const availableLocations = await getAvailableLocations(); // Fetch available locations

  if (!business) {
    notFound();
  }

  return <BusinessDetailClientPage initialBusiness={business} availableDemographics={availableDemographics} availableLocations={availableLocations} />;
}
import { notFound } from "next/navigation";
import { getBusinessProfile } from "../../../businesses/actions";
import BusinessDetailClientPage from "../BusinessDetailClientPage";
import { headers } from "next/headers"; // New import for searchParams

interface BusinessEditPageProps {
  params: Promise<{
    businessId: string;
  }>;
}

export default async function Page({ params: paramsPromise }: BusinessEditPageProps) {
  const params = await paramsPromise; // Await the params promise
  const businessId = parseInt(params.businessId);

  if (isNaN(businessId)) {
    notFound();
  }

  const business = await getBusinessProfile(businessId);

  if (!business) {
    notFound();
  }

  const headerList = headers();
  const searchParams = new URLSearchParams(headerList.get("x-invoke-query") || "");
  const isInternalUserView = searchParams.get("viewMode") === "internal";

  return <BusinessDetailClientPage initialBusiness={business} isInternalUserView={isInternalUserView} />;
}

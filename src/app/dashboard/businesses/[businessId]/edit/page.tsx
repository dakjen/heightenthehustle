import { notFound } from "next/navigation";
import { getBusinessProfile } from "../../../businesses/actions";
import BusinessDetailClientPage from "../BusinessDetailClientPage";

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

  return <BusinessDetailClientPage initialBusiness={business} />;
}

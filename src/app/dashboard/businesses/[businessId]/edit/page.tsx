import { notFound } from "next/navigation";
import { getBusinessProfile } from "../../../businesses/actions"; // Adjust path as needed
import EditBusinessProfileClientPage from "./EditBusinessProfileClientPage";

interface EditPageProps {
  params: { businessId: string };
}

export default async function EditBusinessProfileServerPage({ params }: EditPageProps) {
  const businessId = parseInt(params.businessId);

  if (isNaN(businessId)) {
    notFound();
  }

  const business = await getBusinessProfile(businessId);

  if (!business) {
    notFound();
  }

  return <EditBusinessProfileClientPage initialBusiness={business} />;
}

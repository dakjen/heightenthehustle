import { notFound } from "next/navigation";
import { getBusinessProfile } from "../../../businesses/actions"; // Adjust path as needed
import EditBusinessProfileClientPage from "./EditBusinessProfileClientPage";

interface PageProps {
  params: { businessId: string };
}

export default async function EditBusinessProfileServerPage(props: PageProps) {
  const businessId = parseInt(props.params.businessId);

  if (isNaN(businessId)) {
    notFound();
  }

  const business = await getBusinessProfile(businessId);

  if (!business) {
    notFound();
  }

  return <EditBusinessProfileClientPage initialBusiness={business} />;
}

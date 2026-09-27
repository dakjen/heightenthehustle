import { requireUser } from "@/lib/auth";
import { getAllUserBusinesses } from "./actions";
import BusinessesClient from "./BusinessesClient";

// Server component: loads the signed-in user's businesses and hands them to the
// client shell, which opens straight into the create form when there are none.
export default async function YourBusinessesPageContent() {
  const user = await requireUser();
  const businesses = await getAllUserBusinesses(user.id);

  return (
    <BusinessesClient
      ownerName={user.name}
      businesses={businesses.map((b) => ({
        id: b.id,
        businessName: b.businessName,
        ownerName: b.ownerName,
        businessType: b.businessType,
        businessIndustry: b.businessIndustry,
        city: b.city,
        state: b.state,
        isArchived: b.isArchived,
        logoUrl: b.logoUrl,
      }))}
    />
  );
}

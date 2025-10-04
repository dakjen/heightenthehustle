import BusinessSearchAndFilter from "./BusinessSearchAndFilter";
import YourBusinessesPageContent from "../../businesses/YourBusinessesPageContent"; // Adjust path as needed

interface AdminBusinessesPageProps {
  searchParams: {
    viewMode?: string;
  };
}

export default async function AdminBusinessesPage({ searchParams }: AdminBusinessesPageProps) {
  const isInternalUserView = searchParams.viewMode === "internal";

  return (
    <div className="flex-1 p-6">
      {isInternalUserView ? (
        <YourBusinessesPageContent />
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-900">All Businesses</h1>
          <p className="mt-4 text-gray-700">View and manage all businesses in the system.</p>
          <BusinessSearchAndFilter />
        </>
      )}
    </div>
  );
}

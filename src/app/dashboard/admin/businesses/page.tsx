import BusinessSearchAndFilter from "./BusinessSearchAndFilter";
import dynamic from 'next/dynamic';

const YourBusinessesPageContent = dynamic(() => import('../../businesses/YourBusinessesPageContent'), { ssr: false });

export default async function AdminBusinessesPage({ searchParams }: { searchParams: { viewMode?: string } }) {
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

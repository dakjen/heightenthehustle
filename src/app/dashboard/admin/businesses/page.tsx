import BusinessSearchAndFilter from "./BusinessSearchAndFilter";

export default async function AdminBusinessesPage() {
  return (
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-gray-900">All Businesses</h1>
      <p className="mt-4 text-gray-700">View and manage all businesses in the system.</p>
      <BusinessSearchAndFilter />
    </div>
  );
}

import BusinessSearchAndFilter from "../BusinessSearchAndFilter";

export default function AdminBusinessesPage() {
  return (
    <div className="flex-1 p-6">
      <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Admin</p>
      <h1 className="text-5xl text-gray-900 leading-none">All businesses</h1>
      <p className="mt-3 text-gray-700">Search, filter, archive and manage every member business.</p>
      <BusinessSearchAndFilter />
    </div>
  );
}

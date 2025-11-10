export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col text-gray-900 p-6">
      {children}
    </div>
  );
}

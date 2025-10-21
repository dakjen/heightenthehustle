import type { PageProps } from 'next';

export default function EditClassPage({ params }: PageProps<{ classId: string }>) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Class {params.classId}</h1>
      <p>Form to edit class with ID: {params.classId}.</p>
      {/* TODO: Implement form for editing classes */}
    </div>
  );
}
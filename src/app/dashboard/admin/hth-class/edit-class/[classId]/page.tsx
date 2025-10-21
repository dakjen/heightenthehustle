import React from 'react';
import type { PageProps } from 'next';

export default async function EditClassPage({ params }: PageProps<{ classId: string }>) {
  const resolvedParams = await params;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Class {resolvedParams.classId}</h1>
      <p>Form to edit class with ID: {resolvedParams.classId}.</p>
      {/* TODO: Implement form for editing classes */}
    </div>
  );
}
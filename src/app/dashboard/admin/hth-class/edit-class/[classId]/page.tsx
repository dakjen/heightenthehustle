import React from 'react';

export default function EditClassPage({ params }: { params: { classId: string } }) {
  const typedParams = params as { classId: string };
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Class {typedParams.classId}</h1>
      <p>Form to edit class with ID: {typedParams.classId}.</p>
      {/* TODO: Implement form for editing classes */}
    </div>
  );
}
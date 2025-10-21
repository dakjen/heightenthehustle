import React from "react";

export default async function EditClassPage(props: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
  const resolvedParams = await Promise.resolve(props.params);
  const { classId } = resolvedParams;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Class {classId}</h1>
      <p>Form to edit class with ID: {classId}.</p>
      {/* TODO: Implement form for editing classes */}
    </div>
  );
}
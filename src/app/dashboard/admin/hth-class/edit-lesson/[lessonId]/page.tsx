import React from 'react';

export default async function EditLessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Lesson {params.lessonId}</h1>
      <p>Form to edit lesson with ID: {params.lessonId}.</p>
      {/* TODO: Implement form for editing lessons */}
    </div>
  );
}
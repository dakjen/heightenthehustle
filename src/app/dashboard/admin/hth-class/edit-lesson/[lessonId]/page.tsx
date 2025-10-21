import React from 'react';

export default function EditLessonPage({ params }: { params: { lessonId: string } }) {
  const typedParams = params as { lessonId: string };
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Lesson {typedParams.lessonId}</h1>
      <p>Form to edit lesson with ID: {typedParams.lessonId}.</p>
      {/* TODO: Implement form for editing lessons */}
    </div>
  );
}
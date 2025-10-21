import React from 'react';

interface EditLessonPageProps {
  params: { lessonId: string };
}

export default function EditLessonPage({ params }: EditLessonPageProps) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Lesson {params.lessonId}</h1>
      <p>Form to edit lesson with ID: {params.lessonId}.</p>
      {/* TODO: Implement form for editing lessons */}
    </div>
  );
}
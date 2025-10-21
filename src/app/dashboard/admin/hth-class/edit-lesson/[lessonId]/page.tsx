import React from 'react';
import type { PageProps } from 'next';

export default async function EditLessonPage({ params }: PageProps<{ lessonId: string }>) {
  const resolvedParams = await params;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Lesson {resolvedParams.lessonId}</h1>
      <p>Form to edit lesson with ID: {resolvedParams.lessonId}.</p>
      {/* TODO: Implement form for editing lessons */}
    </div>
  );
}
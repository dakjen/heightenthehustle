import React from "react";

export default async function EditLessonPage(props: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
  const resolvedParams = await Promise.resolve(props.params);
  const { lessonId } = resolvedParams;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Lesson {lessonId}</h1>
      <p>Form to edit lesson with ID: {lessonId}.</p>
      {/* TODO: Implement form for editing lessons */}
    </div>
  );
}
import React from 'react';
import { getClassById, updateClass, getInternalAndAdminUsers } from '../../actions';
import { redirect } from 'next/navigation';
import SyllabusUploadInput from '../../SyllabusUploadInput'; // Import the new component

export default async function EditClassPage(props: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
  const resolvedParams = await Promise.resolve(props.params);
  const { classId } = resolvedParams;

  const classItem = await getClassById(parseInt(classId));
  const teachers = await getInternalAndAdminUsers();

  if (!classItem) {
    return <div className="container mx-auto p-6 text-red-500">Class not found.</div>;
  }

  async function handleSubmit(formData: FormData) {
    'use server';
    try {
      // The syllabusUrl will be automatically included in formData from the hidden input
      await updateClass(parseInt(classId), formData);
      redirect('/dashboard/admin/hth-class');
    } catch (error) {
      console.error('Error updating class:', error);
      // TODO: Display an error message to the user
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Class: {classItem.title}</h1>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={classItem.title}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={classItem.description || ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
        </div>
        <div>
          <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">Teacher</label>
          <select
            id="teacherId"
            name="teacherId"
            required
            defaultValue={classItem.teacherId}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Class Type</label>
          <select
            id="type"
            name="type"
            required
            defaultValue={classItem.type}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="pre-course">Pre-Course</option>
            <option value="hth-course">HTH Course</option>
          </select>
        </div>
        <div>
          <label htmlFor="syllabus" className="block text-sm font-medium text-gray-700">Syllabus (PDF)</label>
          <SyllabusUploadInput onUploadSuccess={() => {}} initialUrl={classItem.syllabusUrl} />
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-500"
        >
          Update Class
        </button>
      </form>
    </div>
  );
}
import React from 'react';
import { createLesson } from '../actions'; // Adjust path as needed
import { redirect } from 'next/navigation';

export default function AddLessonPage() {
  async function handleSubmit(formData: FormData) {
    'use server';
    try {
      await createLesson(formData);
      // TODO: Redirect to the class detail page or lesson list after creation
      redirect('/dashboard/admin/hth-class'); // Redirect to the admin class list for now
    } catch (error) {
      console.error('Error creating lesson:', error);
      // TODO: Display an error message to the user
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Lesson</h1>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Class ID</label>
          <input
            type="number"
            id="classId"
            name="classId"
            required
            // TODO: Replace with a dynamic selection of actual classes
            defaultValue={1} // Placeholder for now
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            id="content"
            name="content"
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
        </div>
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700">Order</label>
          <input
            type="number"
            id="order"
            name="order"
            required
            defaultValue={1} // Placeholder for now
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Lesson
        </button>
      </form>
    </div>
  );
}
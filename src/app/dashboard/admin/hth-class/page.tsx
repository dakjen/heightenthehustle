import React from 'react';
import Link from 'next/link';
import { getAllClasses } from './actions'; // Adjust path as needed

export default async function AdminHTHClassPage() {
  const allClasses = await getAllClasses();
  console.log('All Classes:', allClasses); // Added console.log
  const preCourseClasses = allClasses.filter(cls => cls.type === 'pre-course');
  const hthCourseClasses = allClasses.filter(cls => cls.type === 'hth-course');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">HTH Class - Admin View (Teacher)</h1>

      <div className="mb-6">
        <Link href="/dashboard/admin/hth-class/add-class" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Add New Class
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4">Pre-Course Classes</h2>
      {preCourseClasses.length === 0 ? (
        <p>No Pre-Course classes found. Add a new class to get started.</p>
      ) : (
        <ul className="space-y-4">
          {preCourseClasses.map((classItem) => (
            <li key={classItem.id} className="bg-white shadow overflow-hidden rounded-md px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{classItem.title}</h3>
                  <p className="text-sm text-gray-500">{classItem.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/dashboard/admin/hth-class/edit-class/${classItem.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Edit Class
                  </Link>
                  <Link href={`/dashboard/admin/hth-class/add-lesson?classId=${classItem.id}`} className="text-green-600 hover:text-green-900">
                    Add Lesson
                  </Link>
                  {/* TODO: Add Delete Class functionality */}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-2xl font-bold mb-4 mt-8">HTH Course Classes</h2>
      {hthCourseClasses.length === 0 ? (
        <p>No HTH Course classes found. Add a new class to get started.</p>
      ) : (
        <ul className="space-y-4">
          {hthCourseClasses.map((classItem) => (
            <li key={classItem.id} className="bg-white shadow overflow-hidden rounded-md px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{classItem.title}</h3>
                  <p className="text-sm text-gray-500">{classItem.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/dashboard/admin/hth-class/edit-class/${classItem.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Edit Class
                  </Link>
                  <Link href={`/dashboard/admin/hth-class/add-lesson?classId=${classItem.id}`} className="text-green-600 hover:text-green-900">
                    Add Lesson
                  </Link>
                  {/* TODO: Add Delete Class functionality */}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
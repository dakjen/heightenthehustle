'use client';

import { useState } from 'react';

interface CreateEventModalProps {
  onAdd: (event: { name: string; description?: string }) => void;
  onClose: () => void;
}

export default function CreateEventModal({ onAdd, onClose }: CreateEventModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Event name is required.');
      return;
    }
    onAdd({ name, description });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Competition Event</h3>
          <form onSubmit={handleSubmit} className="mt-2 px-7 py-3">
            <input
              type="text"
              placeholder="Event Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-3 px-3 py-2 text-gray-700 bg-gray-100 rounded-md w-full"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-3 px-3 py-2 text-gray-700 bg-gray-100 rounded-md w-full"
              rows={4}
            />
            <div className="items-center px-4 py-3">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Create Event
              </button>
            </div>
          </form>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
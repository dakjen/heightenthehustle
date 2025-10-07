'use client';

import { useState } from "react";
import { users, businesses } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

type User = InferSelectModel<typeof users>;
type Business = InferSelectModel<typeof businesses>;

interface AddProjectModalProps {
  onAdd: (project: { projectName: string; projectLocation: string; submissionDate: string; pitchVideoUrl: string; pitchDeckUrl:string }) => void;
  onClose: () => void;
}

export default function AddProjectModal({ onAdd, onClose }: AddProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [pitchVideoUrl, setPitchVideoUrl] = useState("");
  const [pitchDeckUrl, setPitchDeckUrl] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAdd({ projectName, projectLocation, submissionDate, pitchVideoUrl, pitchDeckUrl });
    onClose(); // Close modal after submission
  };

  return (
    <>
        <div className="z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              {/* <div className="absolute inset-0 bg-gray-500 opacity-75"></div> */}
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Project</h3>
                  <div className="mt-2">
                    <div className="mb-4">
                      <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        name="projectName"
                        id="projectName"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="projectLocation" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        name="projectLocation"
                        id="projectLocation"
                        value={projectLocation}
                        onChange={(e) => setProjectLocation(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="submissionDate" className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <input
                        type="date"
                        name="submissionDate"
                        id="submissionDate"
                        value={submissionDate}
                        onChange={(e) => setSubmissionDate(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="pitchVideoUrl" className="block text-sm font-medium text-gray-700">
                        Pitch Video URL
                      </label>
                      <input
                        type="text"
                        name="pitchVideoUrl"
                        id="pitchVideoUrl"
                        value={pitchVideoUrl}
                        onChange={(e) => setPitchVideoUrl(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label htmlFor="pitchDeckUrl" className="block text-sm font-medium text-gray-700">
                        Pitch Deck URL
                      </label>
                      <input
                        type="text"
                        name="pitchDeckUrl"
                        id="pitchDeckUrl"
                        value={pitchDeckUrl}
                        onChange={(e) => setPitchDeckUrl(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={onClose} // Use onClose prop
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
    </>
  );
}

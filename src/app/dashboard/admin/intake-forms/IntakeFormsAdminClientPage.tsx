"use client";

import { useState } from "react";
import { IntakeFormWithUser, updateIntakeFormStatus } from "@/app/dashboard/intake-form/actions";

interface Props {
  initialForms: IntakeFormWithUser[];
}

export default function IntakeFormsAdminClientPage({ initialForms }: Props) {
  const [forms, setForms] = useState(initialForms);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredForms = filterStatus === "all"
    ? forms
    : forms.filter((f) => f.status === filterStatus);

  const handleStatusChange = async (formId: number, newStatus: 'submitted' | 'reviewed' | 'archived') => {
    const result = await updateIntakeFormStatus(formId, newStatus);
    if (!result.error) {
      setForms(forms.map((f) => f.id === formId ? { ...f, status: newStatus } : f));
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900">Client Intake Forms</h1>
      <p className="mt-2 text-gray-700">Review and manage submitted client intake forms.</p>

      {/* Filter Tabs */}
      <div className="mt-6 flex space-x-2">
        {["all", "submitted", "reviewed", "archived"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterStatus === status
                ? "bg-[#910000] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== "all" && (
              <span className="ml-1 text-xs">
                ({forms.filter((f) => status === "all" ? true : f.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Forms List */}
      <div className="mt-6 space-y-4">
        {filteredForms.length === 0 ? (
          <p className="text-gray-500">No intake forms found.</p>
        ) : (
          filteredForms.map((form) => (
            <div key={form.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* Header - Always visible */}
              <button
                onClick={() => setExpandedId(expandedId === form.id ? null : form.id)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{form.user.name}</p>
                    <p className="text-sm text-gray-500">{form.user.email} | {form.user.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Stage: <span className="font-medium">{form.businessStage}</span>
                      {" | "}
                      Submitted: {new Date(form.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      form.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                      form.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedId === form.id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === form.id && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase">Business Description</h3>
                      <p className="mt-1 text-gray-900">{form.businessDescription}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase">Services Needed</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {form.servicesNeeded && form.servicesNeeded.length > 0 ? (
                          form.servicesNeeded.map((service) => (
                            <span key={service} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {service}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm">None selected</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase">Current Revenue</h3>
                      <p className="mt-1 text-gray-900">{form.currentRevenue || "Not specified"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase">Number of Employees</h3>
                      <p className="mt-1 text-gray-900">{form.numberOfEmployees || "Not specified"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase">Primary Goals</h3>
                      <p className="mt-1 text-gray-900">{form.primaryGoals}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase">Biggest Challenges</h3>
                      <p className="mt-1 text-gray-900">{form.biggestChallenges}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase">How They Heard About HTH</h3>
                      <p className="mt-1 text-gray-900">{form.howDidYouHear || "Not specified"}</p>
                    </div>

                    {form.additionalNotes && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Additional Notes</h3>
                        <p className="mt-1 text-gray-900">{form.additionalNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Status Actions */}
                  <div className="mt-6 flex space-x-3 border-t border-gray-100 pt-4">
                    {form.status !== 'reviewed' && (
                      <button
                        onClick={() => handleStatusChange(form.id, 'reviewed')}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                      >
                        Mark as Reviewed
                      </button>
                    )}
                    {form.status !== 'archived' && (
                      <button
                        onClick={() => handleStatusChange(form.id, 'archived')}
                        className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600"
                      >
                        Archive
                      </button>
                    )}
                    {form.status !== 'submitted' && (
                      <button
                        onClick={() => handleStatusChange(form.id, 'submitted')}
                        className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600"
                      >
                        Mark as Pending
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

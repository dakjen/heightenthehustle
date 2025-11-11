'use client';

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { FormState } from "@/types/form-state";
import { optOutUser } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
    >
      {pending ? "Submitting..." : "Confirm and Opt Out"}
    </button>
  );
}

export default function OptOutForm({ userName, isOptedOut: initialIsOptedOut }: { userName: string, isOptedOut: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction] = useFormState(optOutUser, { message: "" });
  const [isOptedOut, setIsOptedOut] = useState(initialIsOptedOut);

  useEffect(() => {
    if (state?.message && !state.error) {
      setIsOptedOut(true);
      setIsModalOpen(false);
    }
  }, [state]);

  if (isOptedOut) {
    return (
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p className="font-bold">You have opted out</p>
        <p>You will no longer receive business communications, including funding alerts, business resources, notes, and pitch alerts.</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
      >
        Opt Out of Communications
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Confirm Opt-Out</h2>
            <p className="mb-4 text-gray-600">
              Please confirm that you wish to no longer receive any business communications, including funding alerts, business resources, notes, and pitch alerts.
            </p>
            <p className="mb-6 text-gray-600">
              To complete this action, please type your full name (<span className="font-mono bg-gray-100 p-1 rounded">{userName}</span>) in the box below.
            </p>
            
            <form action={formAction}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {state?.error && <p className="text-red-500 text-sm mb-4">{state.error}</p>}
              {state?.message && !state.error && <p className="text-green-500 text-sm mb-4">{state.message}</p>}

              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

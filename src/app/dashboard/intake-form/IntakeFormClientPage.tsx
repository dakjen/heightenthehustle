"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { submitIntakeForm, getUserIntakeForms } from "./actions";
import { fetchSession } from "@/app/dashboard/businesses/actions";
import { FormState } from "@/types/form-state";
import { ClientIntakeForm } from "@/db/schema";

const serviceOptions = [
  'Funding & Grants',
  'Mentorship',
  'Networking',
  'Business Classes',
  'Pitch Competition',
  'Marketing Support',
  'Legal Guidance',
  'Other',
];

export default function IntakeFormClientPage() {
  const [existingForms, setExistingForms] = useState<ClientIntakeForm[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [state, formAction] = useActionState<FormState, FormData>(submitIntakeForm, { message: "" });

  useEffect(() => {
    async function loadData() {
      const session = await fetchSession();
      if (session?.user) {
        const forms = await getUserIntakeForms(session.user.id);
        setExistingForms(forms);
        if (forms.length === 0) {
          setShowForm(true);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (state?.message && !state?.error) {
      async function refresh() {
        const session = await fetchSession();
        if (session?.user) {
          const forms = await getUserIntakeForms(session.user.id);
          setExistingForms(forms);
          setShowForm(false);
        }
      }
      refresh();
    }
  }, [state]);

  if (loading) {
    return <div className="flex-1 p-6">Loading...</div>;
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900">Client Intake Form</h1>
      <p className="mt-2 text-gray-700">
        Help us understand your business and how we can best support you.
      </p>

      {existingForms.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Submitted Forms</h2>
          <div className="space-y-4">
            {existingForms.map((form) => (
              <div key={form.id} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-[#910000]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      Submitted {new Date(form.submittedAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      Business Stage: {form.businessStage}
                    </p>
                    <p className="mt-1 text-gray-700 text-sm">{form.businessDescription}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    form.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                    form.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                  </span>
                </div>
                {form.servicesNeeded && form.servicesNeeded.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-600">Services Requested:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {form.servicesNeeded.map((service) => (
                        <span key={service} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {showForm ? "Cancel" : existingForms.length > 0 ? "Submit Another Form" : "Fill Out Intake Form"}
        </button>
      </div>

      {showForm && (
        <div className="mt-8 max-w-2xl p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tell Us About Your Business</h2>
          <form action={formAction} className="space-y-6">

            {/* Business Stage */}
            <div>
              <label htmlFor="businessStage" className="block text-sm font-medium text-gray-700">
                What stage is your business in? *
              </label>
              <select
                id="businessStage"
                name="businessStage"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              >
                <option value="">Select a stage</option>
                <option value="Idea">Idea - I have a concept but haven&apos;t started yet</option>
                <option value="Startup">Startup - I&apos;m in the early stages of building</option>
                <option value="Growing">Growing - My business is operational and expanding</option>
                <option value="Established">Established - My business is mature and stable</option>
              </select>
            </div>

            {/* Business Description */}
            <div>
              <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
                Describe your business or business idea *
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                rows={4}
                required
                placeholder="Tell us what your business does, who your customers are, and what makes it unique..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              ></textarea>
            </div>

            {/* Services Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What services are you looking for? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {serviceOptions.map((service) => (
                  <label key={service} className="flex items-center space-x-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name={`service_${service}`}
                      className="rounded border-gray-300 text-[#910000] focus:ring-[#910000]"
                    />
                    <span>{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Current Revenue */}
            <div>
              <label htmlFor="currentRevenue" className="block text-sm font-medium text-gray-700">
                Current Annual Revenue (approximate)
              </label>
              <select
                id="currentRevenue"
                name="currentRevenue"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              >
                <option value="">Select a range</option>
                <option value="Pre-revenue">Pre-revenue</option>
                <option value="Under $10,000">Under $10,000</option>
                <option value="$10,000 - $50,000">$10,000 - $50,000</option>
                <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                <option value="$100,000 - $500,000">$100,000 - $500,000</option>
                <option value="$500,000+">$500,000+</option>
              </select>
            </div>

            {/* Number of Employees */}
            <div>
              <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700">
                Number of Employees
              </label>
              <select
                id="numberOfEmployees"
                name="numberOfEmployees"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              >
                <option value="">Select a range</option>
                <option value="Just me">Just me</option>
                <option value="2-5">2-5</option>
                <option value="6-10">6-10</option>
                <option value="11-25">11-25</option>
                <option value="26-50">26-50</option>
                <option value="50+">50+</option>
              </select>
            </div>

            {/* Primary Goals */}
            <div>
              <label htmlFor="primaryGoals" className="block text-sm font-medium text-gray-700">
                What are your primary business goals? *
              </label>
              <textarea
                id="primaryGoals"
                name="primaryGoals"
                rows={3}
                required
                placeholder="What do you hope to achieve in the next 6-12 months?"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              ></textarea>
            </div>

            {/* Biggest Challenges */}
            <div>
              <label htmlFor="biggestChallenges" className="block text-sm font-medium text-gray-700">
                What are your biggest challenges right now? *
              </label>
              <textarea
                id="biggestChallenges"
                name="biggestChallenges"
                rows={3}
                required
                placeholder="What obstacles are you facing in growing your business?"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              ></textarea>
            </div>

            {/* How Did You Hear */}
            <div>
              <label htmlFor="howDidYouHear" className="block text-sm font-medium text-gray-700">
                How did you hear about Heighten The Hustle?
              </label>
              <select
                id="howDidYouHear"
                name="howDidYouHear"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              >
                <option value="">Select an option</option>
                <option value="Social Media">Social Media</option>
                <option value="Word of Mouth">Word of Mouth</option>
                <option value="Online Search">Online Search</option>
                <option value="Community Event">Community Event</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
                Anything else you&apos;d like us to know?
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                rows={3}
                placeholder="Any additional information, questions, or specific needs..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              ></textarea>
            </div>

            {state?.message && (
              <p className="text-sm text-green-600">{state.message}</p>
            )}
            {state?.error && (
              <p className="text-sm text-red-600">{state.error}</p>
            )}

            <div>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-[#910000] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Submit Intake Form
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { submitIntakeForm, getUserIntakeForms, getPitchEventOptions, PitchEventOption } from "./actions";
import { fetchSession } from "@/app/dashboard/businesses/actions";
import { FormState } from "@/types/form-state";
import { ClientIntakeForm } from "@/db/schema";
import {
  Field, FormSection, SubmitButton, FormError, FormSuccess, RequiredNote,
  inputClass, checkboxClass, secondaryButtonClass, ghostButtonClass,
} from "@/app/components/form";

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

const checkCardClass =
  "flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 transition hover:border-[#910000]/50 hover:bg-[#910000]/[0.03] has-[:checked]:border-[#910000] has-[:checked]:bg-[#910000]/[0.05]";

const statusClass: Record<string, string> = {
  reviewed: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-700",
  submitted: "bg-yellow-100 text-yellow-800",
};

export default function IntakeFormClientPage() {
  const [existingForms, setExistingForms] = useState<ClientIntakeForm[]>([]);
  const [pitchEvents, setPitchEvents] = useState<PitchEventOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [state, formAction] = useActionState<FormState, FormData>(submitIntakeForm, { message: "" });

  useEffect(() => {
    async function loadData() {
      const session = await fetchSession();
      setPitchEvents(await getPitchEventOptions());
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
    return (
      <div className="w-full max-w-4xl mx-auto">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  const hasForms = existingForms.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between hth-fade-up">
        <div>
          <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Intake Form</p>
          <h1 className="text-5xl text-gray-900 leading-none">
            {hasForms ? "Your intake forms" : "Tell us about your business."}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            Help us understand where you are and how we can best support you.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className={showForm ? ghostButtonClass : secondaryButtonClass}
        >
          {showForm ? "Cancel" : hasForms ? "+ Submit another form" : "Fill out intake form"}
        </button>
      </header>

      {state?.message && !state?.error && !showForm && (
        <div className="mb-6 hth-fade-up">
          <FormSuccess message={state.message} />
        </div>
      )}

      {hasForms && (
        <section className="hth-fade-up hth-fade-up-delay-1">
          <h2 className="mb-4 text-3xl text-gray-900">Your Submitted Forms</h2>
          <div className="space-y-4">
            {existingForms.map((form) => (
              <article key={form.id} className="hth-card p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Submitted {new Date(form.submittedAt).toLocaleDateString()}
                    </p>
                    <h3 className="mt-1 text-2xl leading-tight text-gray-900">{form.businessStage} stage</h3>
                    <p className="mt-2 text-sm text-gray-700">{form.businessDescription}</p>
                  </div>
                  <span
                    className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      statusClass[form.status] ?? statusClass.submitted
                    }`}
                  >
                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                  </span>
                </div>

                {form.servicesNeeded && form.servicesNeeded.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Services requested</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.servicesNeeded.map((service) => (
                        <span key={service} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {form.pitchEventIds && form.pitchEventIds.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pitched at</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.pitchEventIds.map((id) => (
                        <span key={id} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                          {pitchEvents.find((e) => e.id === id)?.name ?? `Event #${id}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {showForm && (
        <div className={hasForms ? "mt-10 hth-pop" : "hth-fade-up hth-fade-up-delay-1"}>
          {hasForms && <h2 className="mb-4 text-3xl text-gray-900">Submit another form</h2>}

          <form action={formAction} className="space-y-6">
            <FormSection step="01" title="About your business" description="Where you are today.">
              <Field name="businessStage" label="What stage is your business in?" required className="sm:col-span-2">
                <select id="businessStage" name="businessStage" required defaultValue="" className={inputClass}>
                  <option value="" disabled>Select a stage…</option>
                  <option value="Idea">Idea - I have a concept but haven&apos;t started yet</option>
                  <option value="Startup">Startup - I&apos;m in the early stages of building</option>
                  <option value="Growing">Growing - My business is operational and expanding</option>
                  <option value="Established">Established - My business is mature and stable</option>
                </select>
              </Field>
              <Field
                name="businessDescription"
                label="Describe your business or business idea"
                required
                className="sm:col-span-2"
                hint="What you do, who your customers are, and what makes it unique."
              >
                <textarea
                  id="businessDescription"
                  name="businessDescription"
                  rows={4}
                  required
                  placeholder="We roast small-batch coffee and run a cafe in Brooklyn…"
                  className={inputClass}
                />
              </Field>
              <Field name="currentRevenue" label="Current annual revenue" hint="Approximate is fine.">
                <select id="currentRevenue" name="currentRevenue" defaultValue="" className={inputClass}>
                  <option value="">Select a range…</option>
                  <option value="Pre-revenue">Pre-revenue</option>
                  <option value="Under $10,000">Under $10,000</option>
                  <option value="$10,000 - $50,000">$10,000 - $50,000</option>
                  <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                  <option value="$100,000 - $500,000">$100,000 - $500,000</option>
                  <option value="$500,000+">$500,000+</option>
                </select>
              </Field>
              <Field name="numberOfEmployees" label="Number of employees">
                <select id="numberOfEmployees" name="numberOfEmployees" defaultValue="" className={inputClass}>
                  <option value="">Select a range…</option>
                  <option value="Just me">Just me</option>
                  <option value="2-5">2-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-25">11-25</option>
                  <option value="26-50">26-50</option>
                  <option value="50+">50+</option>
                </select>
              </Field>
            </FormSection>

            <FormSection step="02" title="What you need" description="Select everything that applies." columns={1}>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-800">
                  What services are you looking for?
                  <span className="ml-1 text-xs font-normal text-gray-400">optional</span>
                </legend>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {serviceOptions.map((service) => (
                    <label key={service} className={checkCardClass}>
                      <input type="checkbox" name={`service_${service}`} className={checkboxClass} />
                      <span>{service}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="block text-sm font-medium text-gray-800">
                  Which pitch competition(s) have you pitched at?
                  <span className="ml-1 text-xs font-normal text-gray-400">optional</span>
                </legend>
                {pitchEvents.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500">No pitch competitions are listed yet.</p>
                ) : (
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {pitchEvents.map((event) => (
                      <label key={event.id} className={checkCardClass}>
                        <input type="checkbox" name={`pitchEvent_${event.id}`} className={checkboxClass} />
                        <span>{event.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>
            </FormSection>

            <FormSection step="03" title="Goals & challenges" description="What you're working toward and what's in the way." columns={1}>
              <Field name="primaryGoals" label="What are your primary business goals?" required hint="Think about the next 6 to 12 months.">
                <textarea
                  id="primaryGoals"
                  name="primaryGoals"
                  rows={3}
                  required
                  placeholder="What do you hope to achieve in the next 6-12 months?"
                  className={inputClass}
                />
              </Field>
              <Field name="biggestChallenges" label="What are your biggest challenges right now?" required>
                <textarea
                  id="biggestChallenges"
                  name="biggestChallenges"
                  rows={3}
                  required
                  placeholder="What obstacles are you facing in growing your business?"
                  className={inputClass}
                />
              </Field>
            </FormSection>

            <FormSection step="04" title="Anything else" description="Optional, but it helps us help you." columns={1}>
              <Field name="howDidYouHear" label="How did you hear about Heighten The Hustle?">
                <select id="howDidYouHear" name="howDidYouHear" defaultValue="" className={inputClass}>
                  <option value="">Select an option…</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Word of Mouth">Word of Mouth</option>
                  <option value="Online Search">Online Search</option>
                  <option value="Community Event">Community Event</option>
                  <option value="Referral">Referral</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field name="additionalNotes" label="Anything else you'd like us to know?">
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows={3}
                  placeholder="Any additional information, questions, or specific needs..."
                  className={inputClass}
                />
              </Field>
            </FormSection>

            <FormError message={state?.error} />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <RequiredNote />
              <div className="flex gap-3">
                {hasForms && (
                  <button type="button" onClick={() => setShowForm(false)} className={ghostButtonClass}>
                    Cancel
                  </button>
                )}
                <SubmitButton pendingText="Submitting…">Submit intake form</SubmitButton>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

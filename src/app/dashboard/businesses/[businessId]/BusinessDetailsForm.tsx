"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Demographic, BusinessWithLocation, Location } from "@/db/schema";
import { updateBusinessDemographics } from "../actions";
import { FormState } from "@/types/form-state";
import {
  Field, FormSection, SubmitButton, FormError, FormSuccess,
  inputClass, checkboxClass, ghostButtonClass, secondaryButtonClass,
} from "@/app/components/form";

interface BusinessDetailsFormProps {
  initialBusiness: BusinessWithLocation;
  availableDemographics: Demographic[];
  availableLocations: Location[];
  onBusinessUpdate?: () => Promise<void>;
}

/**
 * Owner demographics + business location. Read-only until "Edit" is pressed.
 * Demographics are stored as one array of ids on the business; gender, race
 * and religion are single picks, and "transgender" is an extra id layered on.
 */
export default function BusinessDetailsForm({ initialBusiness, availableDemographics, availableLocations, onBusinessUpdate }: BusinessDetailsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction] = useActionState<FormState, FormData>(updateBusinessDemographics, { message: "" });
  const lastHandled = useRef(state);

  const transgenderId = useMemo(
    () => availableDemographics.find((d) => d.category === "Gender" && d.name === "Transgender")?.id,
    [availableDemographics],
  );
  const byCategory = (cat: Demographic["category"]) =>
    availableDemographics.filter((d) => d.category === cat && d.id !== transgenderId);
  const genders = byCategory("Gender");
  const races = byCategory("Race");
  const religions = byCategory("Religion");
  const states = availableLocations.filter((l) => l.category === "State");
  const regions = availableLocations.filter((l) => l.category === "Region");

  type Pick = number | "";
  interface DetailsForm { gender: Pick; race: Pick; religion: Pick; isTransgender: boolean; state: Pick; region: Pick; city: string }

  // Current values derived from the business record.
  const ids = initialBusiness.demographicIds ?? [];
  const pick = (list: Demographic[]): Pick => ids.find((id) => list.some((d) => d.id === id)) ?? "";
  const initial: DetailsForm = {
    gender: pick(genders),
    race: pick(races),
    religion: pick(religions),
    isTransgender: transgenderId !== undefined && ids.includes(transgenderId),
    state: initialBusiness.stateLocation?.id ?? "",
    region: initialBusiness.regionLocation?.id ?? "",
    city: initialBusiness.city ?? "",
  };
  const initialKey = JSON.stringify(initial);

  const [form, setForm] = useState<DetailsForm>(initial);
  // Re-sync when the business record changes (e.g. after a save refreshes the parent).
  useEffect(() => {
    setForm(JSON.parse(initialKey) as DetailsForm);
  }, [initialKey]);

  // After a successful save, leave edit mode and refresh the parent.
  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.message && !state.error) {
      setIsEditing(false);
      onBusinessUpdate?.();
    }
  }, [state, onBusinessUpdate]);

  const set = <K extends keyof DetailsForm>(key: K, value: DetailsForm[K]) => setForm((f) => ({ ...f, [key]: value }));
  const num = (v: string): Pick => (v === "" ? "" : Number(v));
  const nameOf = (list: { id: number; name: string }[], id: number | "") => list.find((x) => x.id === id)?.name ?? "—";

  // ---------- Read-only summary ----------
  if (!isEditing) {
    const rows: [string, string][] = [
      ["Gender", `${nameOf(genders, form.gender)}${form.isTransgender ? " · Transgender" : ""}`],
      ["Race", nameOf(races, form.race)],
      ["Religion", nameOf(religions, form.religion)],
      ["State", nameOf(states, form.state)],
      ["City", form.city || "—"],
      ["Region", nameOf(regions, form.region)],
    ];
    return (
      <div className="space-y-6">
        <FormSuccess message={state.message && !state.error ? state.message : undefined} />
        <section className="hth-card p-6 lg:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl leading-tight text-gray-900">Owner &amp; location details</h2>
              <p className="text-sm text-gray-600">Used to match you with funding and programs. Only the HTH team sees this.</p>
            </div>
            <button type="button" onClick={() => setIsEditing(true)} className={`${secondaryButtonClass} py-2 text-sm`}>
              Edit
            </button>
          </div>
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wide text-gray-500">{k}</dt>
                <dd className="mt-0.5 font-medium text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    );
  }

  // ---------- Edit form ----------
  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="businessId" value={initialBusiness.id} />
      <input type="hidden" name="isTransgender" value={String(form.isTransgender)} />

      <FormSection step="01" title="About the owner" description="Optional. Some funding is reserved for specific communities, so this helps us find the right fit.">
        <Field name="gender" label="Gender" hideOptional>
          <select id="gender" name="gender" value={form.gender} onChange={(e) => set("gender", num(e.target.value))} className={inputClass}>
            <option value="">Prefer not to say</option>
            {genders.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <div className="flex items-end">
          <label className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 transition has-[:checked]:border-[#910000] has-[:checked]:bg-[#910000]/5">
            <input
              type="checkbox"
              checked={form.isTransgender}
              onChange={(e) => set("isTransgender", e.target.checked)}
              disabled={transgenderId === undefined}
              className={checkboxClass}
            />
            I identify as transgender
          </label>
        </div>
        <Field name="race" label="Race / ethnicity" hideOptional>
          <select id="race" name="race" value={form.race} onChange={(e) => set("race", num(e.target.value))} className={inputClass}>
            <option value="">Prefer not to say</option>
            {races.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field name="religion" label="Religion" hideOptional>
          <select id="religion" name="religion" value={form.religion} onChange={(e) => set("religion", num(e.target.value))} className={inputClass}>
            <option value="">Prefer not to say</option>
            {religions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
      </FormSection>

      <FormSection step="02" title="Where the business operates" description="Lets us send you local grants, events and pitch competitions.">
        <Field name="stateLocationId" label="State" hideOptional>
          <select id="stateLocationId" name="stateLocationId" value={form.state} onChange={(e) => set("state", num(e.target.value))} className={inputClass}>
            <option value="">Choose a state…</option>
            {states.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </Field>
        <Field name="city" label="City" hideOptional>
          <input id="city" name="city" type="text" value={form.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" className={inputClass} />
        </Field>
        <Field name="regionLocationId" label="Region / neighborhood" hideOptional hint="e.g. Hough, Deanwood. Leave blank if none apply.">
          <select id="regionLocationId" name="regionLocationId" value={form.region} onChange={(e) => set("region", num(e.target.value))} className={inputClass}>
            <option value="">None</option>
            {regions.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </Field>
      </FormSection>

      <FormError message={state.error} />

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => { setForm(initial); setIsEditing(false); }} className={ghostButtonClass}>
          Cancel
        </button>
        <SubmitButton>Save details</SubmitButton>
      </div>
    </form>
  );
}

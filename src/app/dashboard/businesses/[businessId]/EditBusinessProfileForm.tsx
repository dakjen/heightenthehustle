"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BusinessWithLocation, Location } from "@/db/schema";
import { updateBusinessProfile } from "./edit/actions";
import { FormState } from "@/types/form-state";
import {
  Field, FormSection, SubmitButton, FormError, FormSuccess, RequiredNote,
  inputClass, fileInputClass, invalidProps,
} from "@/app/components/form";

const US_STATES: [string, string][] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"],
  ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"],
  ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"],
  ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
  ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
  ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"],
  ["PA", "Pennsylvania"], ["PR", "Puerto Rico"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
  ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"],
  ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

interface Props {
  initialBusiness: BusinessWithLocation;
  availableDemographics: { id: number; name: string }[];
  availableLocations: Location[];
  onSaved?: () => Promise<void>;
}

function ImagePicker({ name, label, hint, current, error, square }: { name: string; label: string; hint: string; current: string | null; error?: string; square?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null);
  const shown = preview ?? current;
  return (
    <Field name={name} label={label} error={error} hint={hint}>
      <div className="flex items-center gap-4">
        <div className={`flex shrink-0 items-center justify-center overflow-hidden border border-dashed border-gray-300 bg-gray-50 ${square ? "h-16 w-16 rounded-xl" : "h-16 w-28 rounded-lg"}`}>
          {shown ? (
            <Image src={shown} alt="" width={112} height={64} unoptimized className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">Preview</span>
          )}
        </div>
        <input
          id={name}
          name={name}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return f && f.type.startsWith("image/") ? URL.createObjectURL(f) : null; });
          }}
          className={fileInputClass}
        />
      </div>
    </Field>
  );
}

export default function EditBusinessProfileForm({ initialBusiness: b, availableLocations, onSaved }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(updateBusinessProfile, { message: "" });
  const errors = state.fieldErrors ?? {};
  const last = useRef(state);
  useEffect(() => {
    if (state === last.current) return;
    last.current = state;
    if (state.message && !state.error) onSaved?.();
  }, [state, onSaved]);
  const invalid = (n: string) => invalidProps(n, errors);
  const cities = availableLocations.filter((l) => l.category === "City");

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="businessId" value={b.id} />

      <FormSection step="01" title="The basics" description="What you're called and what you do.">
        <Field name="businessName" label="Business name" required error={errors.businessName} className="sm:col-span-2">
          <input id="businessName" name="businessName" type="text" required defaultValue={b.businessName} className={inputClass} {...invalid("businessName")} />
        </Field>
        <Field name="businessIndustry" label="Industry" required error={errors.businessIndustry}>
          <input id="businessIndustry" name="businessIndustry" type="text" required defaultValue={b.businessIndustry} className={inputClass} {...invalid("businessIndustry")} />
        </Field>
        <Field name="naicsCode" label="NAICS code" error={errors.naicsCode} hint="2 to 6 digits, if you know it.">
          <input id="naicsCode" name="naicsCode" type="text" inputMode="numeric" maxLength={6} defaultValue={b.naicsCode ?? ""} className={inputClass} {...invalid("naicsCode")} />
        </Field>
        <Field name="businessDescription" label="What does your business do?" error={errors.businessDescription} className="sm:col-span-2">
          <textarea id="businessDescription" name="businessDescription" rows={4} defaultValue={b.businessDescription ?? ""} className={inputClass} />
        </Field>
        <ImagePicker name="logo" label="Logo" hint="Square images look best. Up to 5 MB." current={b.logoUrl} error={errors.logo} square />
        <ImagePicker name="businessProfilePhoto" label="Cover photo" hint="Shown behind your business name. Up to 5 MB." current={b.businessProfilePhotoUrl} error={errors.businessProfilePhoto} />
      </FormSection>

      <FormSection step="02" title="Ownership & structure" description="How the business is set up legally.">
        <Field name="ownerName" label="Owner's full name" required error={errors.ownerName}>
          <input id="ownerName" name="ownerName" type="text" required defaultValue={b.ownerName} className={inputClass} {...invalid("ownerName")} />
        </Field>
        <Field name="percentOwnership" label="Your ownership %" required error={errors.percentOwnership}>
          <input id="percentOwnership" name="percentOwnership" type="number" min={1} max={100} step="0.01" required defaultValue={b.percentOwnership} className={inputClass} {...invalid("percentOwnership")} />
        </Field>
        <Field name="businessType" label="Business type" required error={errors.businessType}>
          <select id="businessType" name="businessType" required defaultValue={b.businessType} className={inputClass} {...invalid("businessType")}>
            <option value="Sole Proprietorship">Sole Proprietorship</option>
            <option value="Limited Liability Company (LLC)">LLC (Limited Liability Company)</option>
            <option value="Partnership">Partnership</option>
            <option value="Corporation">Corporation</option>
          </select>
        </Field>
        <Field name="businessTaxStatus" label="Tax status" required error={errors.businessTaxStatus}>
          <select id="businessTaxStatus" name="businessTaxStatus" required defaultValue={b.businessTaxStatus} className={inputClass} {...invalid("businessTaxStatus")}>
            <option value="Not Applicable">Not Applicable</option>
            <option value="S-Corporation">S-Corporation</option>
            <option value="C-Corporation">C-Corporation</option>
          </select>
        </Field>
      </FormSection>

      <FormSection step="03" title="Location & contact" description="Where you operate and how people reach you.">
        <Field name="streetAddress" label="Street address" error={errors.streetAddress} className="sm:col-span-2">
          <input id="streetAddress" name="streetAddress" type="text" autoComplete="street-address" defaultValue={b.streetAddress ?? ""} className={inputClass} />
        </Field>
        <Field name="city" label="City" error={errors.city}>
          <input id="city" name="city" type="text" autoComplete="address-level2" defaultValue={b.city ?? ""} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field name="state" label="State" error={errors.state}>
            <select id="state" name="state" defaultValue={b.state ?? ""} className={inputClass} {...invalid("state")}>
              <option value="">—</option>
              {US_STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          </Field>
          <Field name="zipCode" label="ZIP" error={errors.zipCode}>
            <input id="zipCode" name="zipCode" type="text" inputMode="numeric" maxLength={10} defaultValue={b.zipCode ?? ""} className={inputClass} {...invalid("zipCode")} />
          </Field>
        </div>
        {cities.length > 0 && (
          <Field name="locationId" label="HTH service area" error={errors.locationId} hint="Which HTH city you're closest to.">
            <select id="locationId" name="locationId" defaultValue={b.locationId ?? ""} className={inputClass}>
              <option value="">Not sure</option>
              {cities.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </Field>
        )}
        <Field name="phone" label="Business phone" error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={b.phone ?? ""} className={inputClass} {...invalid("phone")} />
        </Field>
        <Field name="website" label="Website" error={errors.website}>
          <input id="website" name="website" type="text" inputMode="url" defaultValue={b.website ?? ""} placeholder="mybusiness.com" className={inputClass} />
        </Field>
      </FormSection>

      <FormError message={state.error} />
      <FormSuccess message={state.message && !state.error ? state.message : undefined} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <RequiredNote />
        <SubmitButton>Save changes</SubmitButton>
      </div>
    </form>
  );
}

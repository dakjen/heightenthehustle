"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBusinessProfile } from "./actions";
import { FormState } from "@/types/form-state";
import {
  Field, FormSection, SubmitButton, FormError, FormSuccess, RequiredNote,
  inputClass, fileInputClass, ghostButtonClass, invalidProps,
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

const INDUSTRIES = [
  "Beauty & Personal Care", "Construction & Trades", "Consulting & Professional Services",
  "Creative & Media", "Education & Training", "Fashion & Apparel", "Finance & Insurance",
  "Fitness & Wellness", "Food & Beverage", "Healthcare", "Hospitality & Events", "Nonprofit",
  "Real Estate", "Retail & E-commerce", "Technology & Software", "Transportation & Logistics",
];

interface CreateBusinessFormProps {
  defaultOwnerName?: string;
  onCancel?: () => void;
}

export default function CreateBusinessForm({ defaultOwnerName = "", onCancel }: CreateBusinessFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(createBusinessProfile, { message: "" });
  const errors = state.fieldErrors ?? {};
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    });
  }

  useEffect(() => {
    if (state.businessId) {
      router.push(`/dashboard/businesses/${state.businessId}`);
      router.refresh();
    }
  }, [state.businessId, router]);

  const invalid = (name: string) => invalidProps(name, errors);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <FormSection step="01" title="The basics" description="What you're called and what you do.">
        <Field name="businessName" label="Business name" required error={errors.businessName} className="sm:col-span-2">
          <input id="businessName" name="businessName" type="text" required autoComplete="organization" placeholder="e.g. Hustle Coffee Co." className={inputClass} {...invalid("businessName")} />
        </Field>
        <Field name="businessIndustry" label="Industry" required error={errors.businessIndustry} hint="Pick the closest match or type your own.">
          <input id="businessIndustry" name="businessIndustry" type="text" required list="industry-options" placeholder="e.g. Food & Beverage" className={inputClass} {...invalid("businessIndustry")} />
          <datalist id="industry-options">
            {INDUSTRIES.map((i) => <option key={i} value={i} />)}
          </datalist>
        </Field>
        <Field name="naicsCode" label="NAICS code" error={errors.naicsCode} hint="2 to 6 digits. Helps match you to grants. Leave blank if you don't know it.">
          <input id="naicsCode" name="naicsCode" type="text" inputMode="numeric" maxLength={6} placeholder="e.g. 722515" className={inputClass} {...invalid("naicsCode")} />
        </Field>
        <Field name="businessDescription" label="What does your business do?" error={errors.businessDescription} className="sm:col-span-2" hint="A sentence or two is plenty. We use this to find the right opportunities for you.">
          <textarea id="businessDescription" name="businessDescription" rows={3} placeholder="We roast small-batch coffee and run a cafe in Brooklyn…" className={inputClass} />
        </Field>
        <Field name="logo" label="Logo" error={errors.logo} className="sm:col-span-2" hint="PNG, JPG, SVG or WebP up to 5 MB. Square images look best.">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">Preview</span>
              )}
            </div>
            <input id="logo" name="logo" type="file" accept=".png,.jpg,.jpeg,.webp,.gif" onChange={onLogoChange} className={fileInputClass} {...invalid("logo")} />
          </div>
        </Field>
      </FormSection>

      <FormSection step="02" title="Ownership & structure" description="How the business is set up legally.">
        <Field name="ownerName" label="Owner's full name" required error={errors.ownerName}>
          <input id="ownerName" name="ownerName" type="text" required autoComplete="name" defaultValue={defaultOwnerName} className={inputClass} {...invalid("ownerName")} />
        </Field>
        <Field name="percentOwnership" label="Your ownership %" required error={errors.percentOwnership} hint="100 if you're the sole owner.">
          <input id="percentOwnership" name="percentOwnership" type="number" min={1} max={100} step="0.01" required defaultValue={100} className={inputClass} {...invalid("percentOwnership")} />
        </Field>
        <Field name="businessType" label="Business type" required error={errors.businessType}>
          <select id="businessType" name="businessType" required defaultValue="" className={inputClass} {...invalid("businessType")}>
            <option value="" disabled>Choose one…</option>
            <option value="Sole Proprietorship">Sole Proprietorship</option>
            <option value="Limited Liability Company (LLC)">LLC (Limited Liability Company)</option>
            <option value="Partnership">Partnership</option>
            <option value="Corporation">Corporation</option>
          </select>
        </Field>
        <Field name="businessTaxStatus" label="Tax status" required error={errors.businessTaxStatus} hint="Most sole proprietors and single-member LLCs choose Not Applicable.">
          <select id="businessTaxStatus" name="businessTaxStatus" required defaultValue="" className={inputClass} {...invalid("businessTaxStatus")}>
            <option value="" disabled>Choose one…</option>
            <option value="Not Applicable">Not Applicable</option>
            <option value="S-Corporation">S-Corporation</option>
            <option value="C-Corporation">C-Corporation</option>
          </select>
        </Field>
      </FormSection>

      <FormSection step="03" title="Location & contact" description="Where you operate and how people reach you.">
        <Field name="streetAddress" label="Street address" error={errors.streetAddress} className="sm:col-span-2">
          <input id="streetAddress" name="streetAddress" type="text" autoComplete="street-address" className={inputClass} />
        </Field>
        <Field name="city" label="City" error={errors.city}>
          <input id="city" name="city" type="text" autoComplete="address-level2" className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field name="state" label="State" error={errors.state}>
            <select id="state" name="state" defaultValue="" autoComplete="address-level1" className={inputClass} {...invalid("state")}>
              <option value="">—</option>
              {US_STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          </Field>
          <Field name="zipCode" label="ZIP" error={errors.zipCode}>
            <input id="zipCode" name="zipCode" type="text" inputMode="numeric" maxLength={10} autoComplete="postal-code" className={inputClass} {...invalid("zipCode")} />
          </Field>
        </div>
        <Field name="phone" label="Business phone" error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="(555) 555-5555" className={inputClass} {...invalid("phone")} />
        </Field>
        <Field name="website" label="Website" error={errors.website} hint="Instagram or LinkedIn is fine if you don't have a site yet.">
          <input id="website" name="website" type="text" inputMode="url" autoComplete="url" placeholder="mybusiness.com" className={inputClass} />
        </Field>
      </FormSection>

      <FormSection step="04" title="Materials" description="Optional now. You can add more from your business page later.">
        <Field name="businessMaterials" label="Pitch deck, one-pager or brochure" error={errors.businessMaterials} className="sm:col-span-2" hint="PDF, Word, PowerPoint, PNG or JPG. Up to 10 MB.">
          <input
            id="businessMaterials"
            name="businessMaterials"
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
            className={fileInputClass}
          />
        </Field>
      </FormSection>

      {!state.businessId && <FormError message={state.error} />}
      {state.businessId && <FormSuccess message={`${state.message} Taking you to your business page…`} />}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <RequiredNote />
        <div className="flex gap-3">
          {onCancel && (
            <button type="button" onClick={onCancel} className={ghostButtonClass}>
              Cancel
            </button>
          )}
          <SubmitButton>Save my business</SubmitButton>
        </div>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import { BusinessWithLocation } from "@/db/schema";
import { updateBusinessMaterials } from "../actions";
import { FormState } from "@/types/form-state";
import { Field, FormSection, SubmitButton, FormError, FormSuccess, inputClass, fileInputClass } from "@/app/components/form";

interface Props {
  business: BusinessWithLocation;
  onSaved?: () => Promise<void>;
}

/** Up to five public-facing materials (deck, one-pager, brochure…). */
export default function BusinessMaterials({ business, onSaved }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(updateBusinessMaterials, { message: "" });
  const last = useRef(state);
  useEffect(() => {
    if (state === last.current) return;
    last.current = state;
    if (state.message && !state.error) onSaved?.();
  }, [state, onSaved]);

  const slot = (i: number) => ({
    url: business[`material${i}Url` as keyof BusinessWithLocation] as string | null,
    title: (business[`material${i}Title` as keyof BusinessWithLocation] as string | null) ?? "",
  });

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="businessId" value={business.id} />
      <FormSection title="Business materials" description="Pitch decks, one-pagers, brochures, menus. These can be shared with partners and judges. Give each a title so we know what it is." columns={1}>
        {[1, 2, 3, 4, 5].map((i) => {
          const s = slot(i);
          return (
            <div key={i} className="grid gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field name={`material${i}Title`} label={`Title ${i}`} hideOptional>
                <input id={`material${i}Title`} name={`material${i}Title`} type="text" defaultValue={s.title} placeholder="e.g. 2026 pitch deck" className={inputClass} />
              </Field>
              <Field name={`material${i}`} label={s.url ? "Replace file" : "File"} hideOptional>
                <input id={`material${i}`} name={`material${i}`} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" className={fileInputClass} />
              </Field>
              <div className="pb-1 text-sm">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#910000] hover:underline">View current</a>
                ) : (
                  <span className="text-gray-400">Empty</span>
                )}
              </div>
            </div>
          );
        })}
      </FormSection>
      <FormError message={state.error} />
      <FormSuccess message={state.message && !state.error ? state.message : undefined} />
      <div className="flex justify-end">
        <SubmitButton>Save materials</SubmitButton>
      </div>
    </form>
  );
}

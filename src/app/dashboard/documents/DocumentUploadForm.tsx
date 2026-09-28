"use client";

import { useActionState } from "react";
import { uploadDocument } from "./actions";
import { DOCUMENT_ACCEPT } from "./constants";
import { FormState } from "@/types/form-state";
import { Field, FormSection, SubmitButton, FormError, FormSuccess, inputClass, fileInputClass, invalidProps } from "@/app/components/form";

interface Props {
  kinds: readonly string[];
  businesses: { id: number; businessName: string }[];
  /** Admin uploading on a member's behalf. */
  ownerId?: number;
  ownerName?: string;
}

export default function DocumentUploadForm({ kinds, businesses, ownerId, ownerName }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(uploadDocument, { message: "" });
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5" noValidate key={state.message}>
      {ownerId && <input type="hidden" name="ownerId" value={ownerId} />}
      <FormSection
        title={ownerName ? `Upload for ${ownerName}` : "Upload a document"}
        description="Stored privately. Only you and the HTH team can open it."
      >
        <Field name="kind" label="Document type" required error={errors.kind}>
          <select id="kind" name="kind" required defaultValue="" className={inputClass} {...invalidProps("kind", errors)}>
            <option value="" disabled>Choose one…</option>
            {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
        <Field name="title" label="Name" required error={errors.title} hint="e.g. 2026 W-9, Spring pitch deck">
          <input id="title" name="title" type="text" required className={inputClass} {...invalidProps("title", errors)} />
        </Field>
        {businesses.length > 0 && (
          <Field name="businessId" label="Related business" hideOptional>
            <select id="businessId" name="businessId" defaultValue={businesses.length === 1 ? String(businesses[0].id) : ""} className={inputClass}>
              <option value="">Not business-specific</option>
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.businessName}</option>)}
            </select>
          </Field>
        )}
        <Field name="file" label="File" required error={errors.file} hint="PDF, Word, Excel, PowerPoint, PNG or JPG. Up to 15 MB." className={businesses.length > 0 ? "" : "sm:col-span-2"}>
          <input id="file" name="file" type="file" required accept={DOCUMENT_ACCEPT} className={fileInputClass} {...invalidProps("file", errors)} />
        </Field>
        <Field name="notes" label="Notes" error={errors.notes} className="sm:col-span-2">
          <input id="notes" name="notes" type="text" placeholder="Anything the team should know about this file" className={inputClass} />
        </Field>
        <div className="sm:col-span-2 space-y-3">
          <FormError message={state.error} />
          <FormSuccess message={state.message && !state.error ? state.message : undefined} />
          <SubmitButton pendingText="Uploading…">Upload securely</SubmitButton>
        </div>
      </FormSection>
    </form>
  );
}

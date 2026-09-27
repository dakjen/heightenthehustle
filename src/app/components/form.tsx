"use client";

import { useFormStatus } from "react-dom";

/**
 * Shared form building blocks so every form in the portal looks the same.
 * Usage: wrap groups of fields in <FormSection>, each input in <Field>.
 */

export const inputClass =
  "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-[#910000] focus:outline-none focus:ring-2 focus:ring-[#910000]/25 aria-[invalid=true]:border-red-500";

export const checkboxClass =
  "h-4 w-4 rounded border-gray-300 text-[#910000] focus:ring-[#910000]/30";

export const fileInputClass =
  "block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[#910000] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#7a0000]";

export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-[#910000] px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-[#7a0000] hover:shadow-lg disabled:cursor-wait disabled:opacity-70";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border-2 border-[#910000] bg-white px-5 py-2.5 font-semibold text-[#910000] transition hover:bg-[#910000] hover:text-white";

export const ghostButtonClass =
  "inline-flex items-center justify-center rounded-lg border-2 border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:border-gray-400";

/** Props to spread onto an input so screen readers link it to its error. */
export function invalidProps(name: string, errors?: Record<string, string>) {
  return errors?.[name] ? { "aria-invalid": true as const, "aria-describedby": `${name}-error` } : {};
}

interface FieldProps {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  /** Hide the "optional" tag for fields where it reads oddly (e.g. checkboxes). */
  hideOptional?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ name, label, hint, required, hideOptional, error, className = "", children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-800">
        {label}
        {required ? (
          <span className="text-[#910000]"> *</span>
        ) : hideOptional ? null : (
          <span className="ml-1 text-xs font-normal text-gray-400">optional</span>
        )}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

interface FormSectionProps {
  /** Step label like "01". Omit for single-section forms. */
  step?: string;
  title: string;
  description?: string;
  /** Grid columns for the fields. Defaults to 2 on sm+ screens. */
  columns?: 1 | 2;
  children: React.ReactNode;
}

export function FormSection({ step, title, description, columns = 2, children }: FormSectionProps) {
  return (
    <section className="hth-card p-6 lg:p-8">
      <div className="mb-6 flex items-start gap-4">
        {step && <span className="font-display text-3xl leading-none text-[#910000]">{step}</span>}
        <div>
          <h2 className="text-2xl leading-tight text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      <div className={`grid gap-5 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>{children}</div>
    </section>
  );
}

export function SubmitButton({ children, pendingText = "Saving…", className = primaryButtonClass }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
      {message}
    </p>
  );
}

/** Small "required" legend for the bottom of a form. */
export function RequiredNote() {
  return (
    <p className="text-xs text-gray-500">
      <span className="text-[#910000]">*</span> Required. Everything else can be filled in later.
    </p>
  );
}

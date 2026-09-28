"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Resource } from "@/db/schema";
import { createResource, updateResource, deleteResource, toggleResource } from "@/app/dashboard/resources/actions";
import { RESOURCE_CATEGORIES, type ResourceCategory } from "@/app/dashboard/resources/constants";
import { FormState } from "@/types/form-state";
import { Field, FormSection, SubmitButton, FormError, FormSuccess, inputClass, checkboxClass, secondaryButtonClass, ghostButtonClass, invalidProps } from "@/app/components/form";

const CATEGORY_CLS: Record<ResourceCategory, string> = {
  "Grants & Opportunities": "bg-green-100 text-green-800",
  "Business Resources": "bg-[#2b2b2b]/10 text-[#2b2b2b]",
  "Deals & Discounts": "bg-yellow-100 text-yellow-800",
};
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** yyyy-mm-dd for a <input type="date"> default, in local time. */
function toDateInput(d: Date | string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

const smallBtn = "rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:border-gray-400 disabled:opacity-50";

function ResourceForm({ editing, onDone }: { editing: Resource | null; onDone: () => void }) {
  const action = editing ? updateResource : createResource;
  const [state, formAction] = useActionState<FormState, FormData>(action, { message: "" });
  const errors = state.fieldErrors ?? {};
  const formRef = useRef<HTMLFormElement>(null);
  const succeeded = Boolean(state.message && !state.error);

  // After a successful create, clear the form so the next entry starts fresh.
  useEffect(() => {
    if (succeeded && !editing) formRef.current?.reset();
  }, [succeeded, editing]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6" noValidate>
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <FormSection
        title={editing ? `Edit: ${editing.title}` : "Add a resource"}
        description="Members see published resources on their Resources Hub. Featured ones float to the top with a red edge."
      >
        <Field name="category" label="Category" required error={errors.category}>
          <select id="category" name="category" required defaultValue={editing?.category ?? ""} className={inputClass} {...invalidProps("category", errors)}>
            <option value="" disabled>Choose one…</option>
            {RESOURCE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field name="provider" label="Provider" hint='Who offers it, e.g. "SBA" or "QuickBooks".'>
          <input id="provider" name="provider" type="text" defaultValue={editing?.provider ?? ""} className={inputClass} />
        </Field>
        <Field name="title" label="Title" required error={errors.title} className="sm:col-span-2">
          <input id="title" name="title" type="text" required defaultValue={editing?.title ?? ""} className={inputClass} {...invalidProps("title", errors)} />
        </Field>
        <Field name="url" label="Link" error={errors.url} className="sm:col-span-2" hint="Application page, provider site, or signup link.">
          <input id="url" name="url" type="text" inputMode="url" placeholder="example.com/apply" defaultValue={editing?.url ?? ""} className={inputClass} {...invalidProps("url", errors)} />
        </Field>
        <Field name="amount" label="Amount / value" hint='e.g. "$5,000 – $25,000" or "30% off".'>
          <input id="amount" name="amount" type="text" defaultValue={editing?.amount ?? ""} className={inputClass} />
        </Field>
        <Field name="deadline" label="Deadline" error={errors.deadline} hint="For grants and time-limited offers.">
          <input id="deadline" name="deadline" type="date" defaultValue={toDateInput(editing?.deadline ?? null)} className={inputClass} {...invalidProps("deadline", errors)} />
        </Field>
        <Field name="discountCode" label="Discount code">
          <input id="discountCode" name="discountCode" type="text" defaultValue={editing?.discountCode ?? ""} className={`${inputClass} font-mono`} />
        </Field>
        <Field name="tags" label="Tags" hint="Comma-separated, e.g. women-owned, DC, software.">
          <input id="tags" name="tags" type="text" defaultValue={editing?.tags?.join(", ") ?? ""} className={inputClass} />
        </Field>
        <Field name="description" label="Description" className="sm:col-span-2">
          <textarea id="description" name="description" rows={4} defaultValue={editing?.description ?? ""} className={inputClass} />
        </Field>
        <div className="flex flex-wrap gap-6 sm:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" name="isPublished" defaultChecked={editing ? editing.isPublished : true} className={checkboxClass} />
            Published
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" name="isFeatured" defaultChecked={editing?.isFeatured ?? false} className={checkboxClass} />
            Featured
          </label>
        </div>
      </FormSection>

      <FormError message={state.error} />
      <FormSuccess message={succeeded ? state.message : ""} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button type="button" onClick={onDone} className={ghostButtonClass}>
          {editing ? "Cancel" : "Close"}
        </button>
        <SubmitButton pendingText="Saving…">{editing ? "Save changes" : "Add resource"}</SubmitButton>
      </div>
    </form>
  );
}

function ResourceRow({ r, onEdit }: { r: Resource; onEdit: () => void }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const run = (fn: () => Promise<FormState>) =>
    start(async () => {
      const res = await fn();
      setMsg(res.error || res.message);
      setTimeout(() => setMsg(""), 2000);
    });

  return (
    <article className={`hth-card p-5 ${r.isFeatured ? "border-l-4 border-l-[#910000]" : ""} ${r.isPublished ? "" : "opacity-75"}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_CLS[r.category]}`}>{r.category}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
              {r.isPublished ? "Published" : "Draft"}
            </span>
            {r.isFeatured && <span className="text-xs font-semibold uppercase tracking-wide text-[#910000]">Featured</span>}
          </div>
          <h2 className="mt-1 text-2xl leading-tight text-gray-900">{r.title}</h2>
          <p className="text-sm text-gray-600">
            {r.provider ?? "No provider"}
            {r.amount ? ` · ${r.amount}` : ""}
            {r.deadline ? ` · Deadline ${date.format(new Date(r.deadline))}` : ""}
            {r.discountCode ? ` · Code ${r.discountCode}` : ""}
          </p>
          {r.description && <p className="mt-2 line-clamp-2 text-sm text-gray-700">{r.description}</p>}
          <p className="mt-2 text-xs text-gray-500">
            {r.url ? (
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[#910000] hover:underline">{r.url}</a>
            ) : (
              "No link"
            )}
            {r.tags?.length ? ` · ${r.tags.join(", ")}` : ""}
            {" · Updated "}{date.format(new Date(r.updatedAt))}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 lg:w-64 lg:justify-end">
          <button type="button" disabled={pending} onClick={() => run(() => toggleResource(r.id, { isPublished: !r.isPublished }))} className={smallBtn}>
            {r.isPublished ? "Unpublish" : "Publish"}
          </button>
          <button type="button" disabled={pending} onClick={() => run(() => toggleResource(r.id, { isFeatured: !r.isFeatured }))} className={smallBtn}>
            {r.isFeatured ? "Unfeature" : "Feature"}
          </button>
          <button type="button" disabled={pending} onClick={onEdit} className={smallBtn}>Edit</button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm(`Delete "${r.title}"? This can't be undone.`)) run(() => deleteResource(r.id));
            }}
            className={`${smallBtn} border-red-200 text-red-700 hover:border-red-400`}
          >
            Delete
          </button>
        </div>
      </div>
      {msg && <p className="mt-2 text-xs text-gray-600">{msg}</p>}
    </article>
  );
}

type Filter = "all" | "published" | "draft";

export default function ResourcesAdminClient({ resources }: { resources: Resource[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [formOpen, setFormOpen] = useState(resources.length === 0);
  const [editing, setEditing] = useState<Resource | null>(null);
  const formTop = useRef<HTMLDivElement>(null);

  const shown = useMemo(
    () => (filter === "all" ? resources : resources.filter((r) => (filter === "published" ? r.isPublished : !r.isPublished))),
    [resources, filter],
  );
  const publishedCount = resources.filter((r) => r.isPublished).length;

  const openEdit = (r: Resource) => {
    setEditing(r);
    setFormOpen(true);
    requestAnimationFrame(() => formTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const closeForm = () => {
    setEditing(null);
    setFormOpen(false);
  };

  return (
    <div className="w-full max-w-5xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Admin</p>
          <h1 className="text-5xl text-gray-900 leading-none">Resources Hub</h1>
          <p className="mt-2 text-gray-600">{publishedCount} published · {resources.length - publishedCount} drafts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "published", "draft"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === f ? "bg-[#910000] text-white" : "bg-white text-gray-700 border border-gray-300"}`}>
              {f === "all" ? "All" : f === "published" ? "Published" : "Drafts"}
            </button>
          ))}
          {!formOpen && (
            <button type="button" onClick={() => { setEditing(null); setFormOpen(true); }} className={`${secondaryButtonClass} py-2 text-sm`}>
              + New resource
            </button>
          )}
        </div>
      </header>

      <div ref={formTop} />
      {formOpen && (
        <div className="mb-8">
          {/* key remounts the form so defaultValues reflect the row being edited */}
          <ResourceForm key={editing?.id ?? "new"} editing={editing} onDone={closeForm} />
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-gray-600">{resources.length === 0 ? "No resources yet. Add your first one above." : "Nothing here right now."}</p>
      ) : (
        <div className="space-y-4">{shown.map((r) => <ResourceRow key={r.id} r={r} onEdit={() => openEdit(r)} />)}</div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { inputClass } from "./form";

export interface SearchOption {
  value: string;
  label: string;
  /** Extra words to match on (e.g. "dc washington") */
  keywords?: string;
}

interface SearchSelectProps {
  /** Name of the hidden input that carries the chosen value. */
  name: string;
  id?: string;
  options: SearchOption[];
  placeholder?: string;
  required?: boolean;
  /** Offer "Use “<typed text>”" when nothing matches. Its value is `otherValue`; the typed text is posted as `otherName`. */
  allowOther?: boolean;
  otherValue?: string;
  otherName?: string;
  /** Always-available options pinned to the bottom (e.g. "I haven't pitched yet"). */
  pinned?: SearchOption[];
  invalid?: boolean;
  describedBy?: string;
  onChange?: (value: string) => void;
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Searchable single-select: type to filter, pick with mouse or arrow keys.
 * Posts the choice through a hidden input so it works with plain form actions.
 */
export default function SearchSelect({
  name, id, options, placeholder = "Start typing to search…", required, allowOther = true,
  otherValue = "other", otherName = `${name}Other`, pinned = [], invalid, describedBy, onChange,
}: SearchSelectProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const listId = `${autoId}-list`;
  const [query, setQuery] = useState("");
  const [value, setValue] = useState("");
  const [otherText, setOtherText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = norm(query);
    const base = q ? options.filter((o) => norm(`${o.label} ${o.keywords ?? ""}`).includes(q)) : options;
    const list: SearchOption[] = [...base];
    if (allowOther && q && !options.some((o) => norm(o.label) === q)) {
      list.push({ value: otherValue, label: `Use “${query.trim()}” (not listed)` });
    }
    return [...list, ...pinned];
  }, [query, options, pinned, allowOther, otherValue]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => setActive(0), [filtered.length, query]);

  function choose(opt: SearchOption) {
    setValue(opt.value);
    if (opt.value === otherValue) {
      setOtherText(query.trim());
      setQuery(query.trim());
    } else {
      setOtherText("");
      setQuery(opt.label);
    }
    setOpen(false);
    onChange?.(opt.value);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      e.preventDefault();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") { setActive((a) => Math.min(a + 1, filtered.length - 1)); e.preventDefault(); }
    else if (e.key === "ArrowUp") { setActive((a) => Math.max(a - 1, 0)); e.preventDefault(); }
    else if (e.key === "Enter") { if (filtered[active]) choose(filtered[active]); e.preventDefault(); }
    else if (e.key === "Escape") { setOpen(false); }
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      {allowOther && <input type="hidden" name={otherName} value={value === otherValue ? otherText : ""} />}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          required={required && !value}
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setValue(""); setOpen(true); onChange?.(""); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={`${inputClass} pr-9`}
        />
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">
          {value ? (
            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M8 4a4 4 0 103.2 6.4l3.7 3.7a1 1 0 001.4-1.4l-3.7-3.7A4 4 0 008 4zm0 2a2 2 0 110 4 2 2 0 010-4z" clipRule="evenodd" />
          )}
        </svg>
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
        >
          {filtered.length === 0 && <li className="px-3 py-2 text-gray-500">No matches. Keep typing.</li>}
          {filtered.map((opt, i) => (
            <li
              key={opt.value + opt.label}
              role="option"
              aria-selected={value === opt.value}
              onMouseDown={(e) => { e.preventDefault(); choose(opt); }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3 py-2 ${i === active ? "bg-[#910000]/10 text-[#910000]" : "text-gray-800"} ${pinned.includes(opt) ? "border-t border-gray-100 text-gray-600" : ""}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

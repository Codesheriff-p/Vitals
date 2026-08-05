"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export default function Select({
  id,
  name,
  options,
  defaultValue = "",
  placeholder = "Select...",
  required,
  icon: Icon,
  triggerClassName,
  autoSubmit,
}: {
  id?: string;
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  triggerClassName?: string;
  /** Submits the enclosing form whenever the selection changes — for GET
      filter bars that used to auto-submit on a native select's onChange. */
  autoSubmit?: boolean;
}) {
  const reactId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(options.findIndex((o) => o.value === defaultValue), 0));
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const isFirstRender = useRef(true);

  const selected = options.find((o) => o.value === value) ?? null;
  const listboxId = `${reactId}-listbox`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  // Runs after the DOM commits the new value (unlike doing this inline in
  // selectAt, which would submit the form before React updates the hidden
  // select's value — the browser would send the stale one).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (autoSubmit) {
      rootRef.current?.closest("form")?.requestSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function selectAt(index: number) {
    const opt = options[index];
    if (!opt) return;
    setValue(opt.value);
    setActiveIndex(index);
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) selectAt(activeIndex);
        else setOpen(true);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Visually hidden but still a real form field, so name/value/required
          keep working in FormData exactly like a native select would. */}
      <select
        name={name}
        required={required}
        value={value}
        onChange={() => {}}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {Icon && (
        <Icon size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 z-10 text-slate-400 dark:text-white" />
      )}

      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${reactId}-option-${activeIndex}` : undefined}
        className={`relative flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white py-2 pr-3 text-left text-sm shadow-sm transition-colors focus:border-trace-deep focus:ring-2 focus:ring-trace-deep/20 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:focus:border-trace dark:focus:ring-trace/20 ${
          Icon ? "pl-9" : "pl-3"
        } ${triggerClassName ?? ""}`}
      >
        <span className={`truncate capitalize ${selected ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-white"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform dark:text-white ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className="absolute z-20 mt-1.5 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10 dark:border-white/10 dark:bg-screen dark:shadow-black/20"
        >
          {options.map((opt, i) => {
            const isActive = i === activeIndex;
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                id={`${reactId}-option-${i}`}
                role="option"
                aria-selected={isSelected}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => selectAt(i)}
                className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm capitalize transition-colors ${
                  isActive
                    ? "bg-trace-deep/10 text-trace-deep dark:bg-trace/15 dark:text-trace"
                    : "text-slate-700 dark:text-white"
                }`}
              >
                {opt.label}
                {isSelected && <Check size={14} className="shrink-0 text-trace-deep dark:text-trace" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

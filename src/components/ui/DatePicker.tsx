"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/format";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function buildMonthGrid(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const startOffset = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, m, d));
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

export default function DatePicker({
  id,
  name,
  defaultValue = "",
  placeholder = "Select date...",
  required,
  min,
  max,
  triggerClassName,
  autoSubmit,
}: {
  id?: string;
  name: string;
  /** yyyy-mm-dd, matching a native date input's value format. */
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  triggerClassName?: string;
  /** Submits the enclosing form whenever the date changes. */
  autoSubmit?: boolean;
}) {
  const reactId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = defaultValue ? parseISODate(defaultValue) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Runs after the DOM commits the new value — mirrors Select's autoSubmit
  // timing so the hidden input's latest value is what actually gets sent.
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

  function isDisabled(d: Date): boolean {
    const iso = toISODate(d);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  }

  function selectDay(d: Date) {
    if (isDisabled(d)) return;
    setValue(toISODate(d));
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const days = buildMonthGrid(viewMonth);
  const todayIso = toISODate(new Date());
  const listboxId = `${reactId}-calendar`;

  return (
    <div ref={rootRef} className="relative">
      {/* Visually hidden but still a real form field, so name/value/required
          keep working in FormData exactly like a native date input would. */}
      <input
        type="date"
        name={name}
        required={required}
        value={value}
        onChange={() => {}}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />

      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listboxId}
        className={`relative flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-left text-sm shadow-sm transition-colors focus:border-trace-deep focus:ring-2 focus:ring-trace-deep/20 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:focus:border-trace dark:focus:ring-trace/20 ${triggerClassName ?? ""}`}
      >
        <CalendarDays size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 dark:text-white" />
        <span className={`truncate ${value ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-white"}`}>
          {value ? formatDate(value) : placeholder}
        </span>
      </button>

      {open && (
        <div
          id={listboxId}
          role="dialog"
          aria-label="Choose a date"
          className="absolute z-20 mt-1.5 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10 dark:border-white/10 dark:bg-screen dark:shadow-black/20"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, -1))}
              aria-label="Previous month"
              className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-white">
              {viewMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
              className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 dark:text-white">
            {WEEKDAY_LABELS.map((label, i) => (
              <div key={i}>{label}</div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (!d) return <div key={i} />;
              const iso = toISODate(d);
              const selected = iso === value;
              const isToday = iso === todayIso;
              const disabled = isDisabled(d);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(d)}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={selected}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
                    selected
                      ? "bg-trace font-semibold text-ink"
                      : disabled
                        ? "cursor-not-allowed text-slate-300 dark:text-white/20"
                        : isToday
                          ? "border border-trace-deep/40 text-trace-deep dark:border-trace/40 dark:text-trace"
                          : "text-slate-700 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                selectDay(now);
              }}
              className="flex-1 rounded-md border border-slate-200 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
            >
              Today
            </button>
            {!required && value && (
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  setOpen(false);
                }}
                className="flex-1 rounded-md border border-slate-200 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

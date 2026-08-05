"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/actions/laboratory";
import { inputClass, labelClass, btnPrimary, btnOutlineSecondary } from "@/components/ui/buttonStyles";

export interface LabTestDefaults {
  test_name?: string;
  description?: string;
  normal_range?: string;
  unit?: string;
  price?: string;
}

export default function LabTestForm({
  action,
  defaults = {},
  submitLabel,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  defaults?: LabTestDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
      {state?.error && <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className={labelClass}>Test Name *</label>
          <input name="test_name" defaultValue={defaults.test_name} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Price (₦) *</label>
          <input type="number" step="0.01" min={0} name="price" defaultValue={defaults.price} required className={inputClass} />
        </div>
        <div className="md:col-span-3">
          <label className={labelClass}>Description</label>
          <textarea name="description" defaultValue={defaults.description} rows={2} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Normal Range</label>
          <input name="normal_range" defaultValue={defaults.normal_range} placeholder="e.g. 70 - 100" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Unit</label>
          <input name="unit" defaultValue={defaults.unit} placeholder="e.g. mg/dL" className={inputClass} />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href="/laboratory" className={btnOutlineSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

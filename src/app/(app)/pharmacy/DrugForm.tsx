"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/actions/pharmacy";
import { inputClass, labelClass, btnPrimary, btnOutlineSecondary } from "@/components/ui/buttonStyles";

export interface DrugDefaults {
  drug_name?: string;
  category?: string;
  description?: string;
  unit?: string;
  unit_price?: string;
  quantity_in_stock?: string;
  reorder_level?: string;
}

export default function DrugForm({
  action,
  defaults = {},
  submitLabel,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  defaults?: DrugDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
      {state?.error && <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Drug Name *</label>
          <input name="drug_name" defaultValue={defaults.drug_name} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input name="category" defaultValue={defaults.category} placeholder="e.g. Analgesic" className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea name="description" defaultValue={defaults.description} rows={2} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Unit</label>
          <input name="unit" defaultValue={defaults.unit} placeholder="e.g. Tablet" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Unit Price (₦) *</label>
          <input type="number" step="0.01" min={0} name="unit_price" defaultValue={defaults.unit_price} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Quantity in Stock *</label>
          <input type="number" min={0} name="quantity_in_stock" defaultValue={defaults.quantity_in_stock} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Reorder Level</label>
          <input type="number" min={0} name="reorder_level" defaultValue={defaults.reorder_level ?? "10"} className={inputClass} />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href="/pharmacy" className={btnOutlineSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

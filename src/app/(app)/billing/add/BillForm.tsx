"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { X, Plus } from "lucide-react";
import type { FormState } from "@/actions/billing";
import { inputClass, labelClass, btnPrimary, btnOutlineSecondary, iconBtnOutlineDanger } from "@/components/ui/buttonStyles";
import Select from "@/components/ui/Select";
import { formatMoney } from "@/lib/format";

const BILL_CATEGORIES = ["consultation", "lab", "pharmacy", "other"] as const;
const CATEGORY_OPTIONS = BILL_CATEGORIES.map((c) => ({ value: c, label: c }));

interface Row {
  id: number;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

export default function BillForm({
  action,
  patients,
  defaultPatientId,
  appointmentId,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  patients: { id: string; patientNumber: string; firstName: string; lastName: string }[];
  defaultPatientId?: string;
  appointmentId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [rows, setRows] = useState<Row[]>([{ id: 0, description: "", category: "consultation", quantity: 1, unitPrice: 0 }]);
  const [discount, setDiscount] = useState(0);

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName} (${p.patientNumber})` }));

  const subtotal = rows.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0);
  const total = Math.max(subtotal - discount, 0);

  function updateRow(id: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
      {state?.error && <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</div>}

      <input type="hidden" name="appointment_id" value={appointmentId ?? ""} />

      <div className="mb-5">
        <label className={labelClass}>Patient *</label>
        <div className="max-w-md">
          <Select name="patient_id" defaultValue={defaultPatientId ?? ""} required placeholder="Select patient..." options={patientOptions} />
        </div>
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Billable Items</h2>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-1 gap-2 md:grid-cols-12 md:items-end">
            <div className="md:col-span-4">
              <label className="mb-1 block text-xs text-slate-500 dark:text-white">Description</label>
              <input
                name="description"
                value={row.description}
                onChange={(e) => updateRow(row.id, { description: e.target.value })}
                placeholder="e.g. General consultation"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-slate-500 dark:text-white">Category</label>
              <Select name="category" defaultValue={row.category} options={CATEGORY_OPTIONS} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-slate-500 dark:text-white">Qty</label>
              <input
                type="number"
                min={1}
                name="quantity"
                value={row.quantity}
                onChange={(e) => updateRow(row.id, { quantity: Number(e.target.value) || 1 })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-slate-500 dark:text-white">Unit Price (₦)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                name="unit_price"
                value={row.unitPrice}
                onChange={(e) => updateRow(row.id, { unitPrice: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-1">
              <label className="mb-1 block text-xs text-slate-500 dark:text-white">Total</label>
              <input type="text" disabled value={(row.quantity * row.unitPrice).toFixed(2)} className={inputClass} />
            </div>
            <div className="md:col-span-1">
              <button
                type="button"
                onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== row.id) : prev))}
                className={`w-full ${iconBtnOutlineDanger}`}
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setRows((prev) => [
            ...prev,
            { id: (prev.length ? Math.max(...prev.map((r) => r.id)) : 0) + 1, description: "", category: "consultation", quantity: 1, unitPrice: 0 },
          ])
        }
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-trace-deep/40 px-3 py-1.5 text-sm font-medium text-trace-deep hover:bg-trace hover:text-ink dark:border-trace/40 dark:text-trace"
      >
        <Plus size={14} /> Add Another Item
      </button>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:justify-end">
        <div>
          <label className={labelClass}>Discount (₦)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            name="discount"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Subtotal</label>
          <input type="text" disabled value={formatMoney(subtotal)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Total</label>
          <input type="text" disabled value={formatMoney(total)} className={`${inputClass} font-bold`} />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving..." : "Save Bill"}
        </button>
        <Link href="/billing" className={btnOutlineSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

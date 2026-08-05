"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { X, Plus } from "lucide-react";
import type { FormState } from "@/actions/pharmacy";
import { inputClass, labelClass, btnPrimary, btnOutlineSecondary, iconBtnOutlineDanger } from "@/components/ui/buttonStyles";
import Select from "@/components/ui/Select";

interface DrugOption {
  id: string;
  drugName: string;
  unit: string | null;
  quantityInStock: number;
}

export default function PrescriptionForm({
  action,
  patients,
  doctors,
  drugs,
  defaultPatientId,
  defaultDoctorId,
  appointmentId,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  patients: { id: string; patientNumber: string; firstName: string; lastName: string }[];
  doctors: { id: string; name: string }[];
  drugs: DrugOption[];
  defaultPatientId?: string;
  defaultDoctorId?: string;
  appointmentId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [rowIds, setRowIds] = useState<number[]>([0]);
  const nextId = rowIds.length ? Math.max(...rowIds) + 1 : 1;

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName} (${p.patientNumber})` }));
  const doctorOptions = doctors.map((d) => ({ value: d.id, label: d.name }));
  const drugOptions = drugs.map((d) => ({ value: d.id, label: `${d.drugName} (${d.quantityInStock} ${d.unit ?? ""} in stock)` }));

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
      {state?.error && <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</div>}

      <input type="hidden" name="appointment_id" value={appointmentId ?? ""} />

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Patient *</label>
          <Select name="patient_id" defaultValue={defaultPatientId ?? ""} required placeholder="Select patient..." options={patientOptions} />
        </div>
        <div>
          <label className={labelClass}>Prescribing Doctor *</label>
          <Select name="doctor_id" defaultValue={defaultDoctorId ?? ""} required placeholder="Select doctor..." options={doctorOptions} />
        </div>
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Drug Items</h2>
      <div className="space-y-2">
        {rowIds.map((rowId) => (
          <div key={rowId} className="grid grid-cols-1 gap-2 md:grid-cols-12 md:items-end">
            <div className="md:col-span-4">
              <label className="mb-1 block text-xs text-slate-500 dark:text-white">Drug</label>
              <Select name="drug_id" placeholder="Select drug..." options={drugOptions} />
            </div>
            <div className="md:col-span-3">
              <label className="mb-1 block text-xs text-slate-500 dark:text-white">Dosage</label>
              <input name="dosage" placeholder="e.g. 500mg twice daily" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-slate-500 dark:text-white">Quantity</label>
              <input type="number" min={1} name="quantity" defaultValue={1} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-slate-500 dark:text-white">Instructions</label>
              <input name="instructions" placeholder="e.g. After meals" className={inputClass} />
            </div>
            <div className="md:col-span-1">
              <button
                type="button"
                onClick={() => setRowIds((ids) => (ids.length > 1 ? ids.filter((r) => r !== rowId) : ids))}
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
        onClick={() => setRowIds((ids) => [...ids, nextId])}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-trace-deep/40 px-3 py-1.5 text-sm font-medium text-trace-deep hover:bg-trace hover:text-ink dark:border-trace/40 dark:text-trace"
      >
        <Plus size={14} /> Add Another Drug
      </button>

      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving..." : "Save Prescription"}
        </button>
        <Link href="/pharmacy/prescriptions" className={btnOutlineSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

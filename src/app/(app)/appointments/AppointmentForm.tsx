"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/actions/appointments";
import { APPOINTMENT_TYPES, APPOINTMENT_STATUSES } from "@/lib/appointmentTypes";
import { inputClass, labelClass, btnPrimary, btnOutlineSecondary } from "@/components/ui/buttonStyles";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";

const TYPE_OPTIONS = APPOINTMENT_TYPES.map((t) => ({ value: t, label: t }));
const STATUS_OPTIONS = APPOINTMENT_STATUSES.map((s) => ({ value: s, label: s }));

export interface AppointmentDefaults {
  patient_id?: string;
  doctor_id?: string;
  appointment_date?: string;
  appointment_time?: string;
  type?: string;
  status?: string;
  notes?: string;
}

export default function AppointmentForm({
  action,
  patients,
  doctors,
  defaults = {},
  submitLabel,
  cancelHref,
  showStatus,
  hiddenFields,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  patients: { id: string; patientNumber: string; firstName: string; lastName: string }[];
  doctors: { id: string; name: string; departmentName?: string | null }[];
  defaults?: AppointmentDefaults;
  submitLabel: string;
  cancelHref: string;
  showStatus?: boolean;
  hiddenFields?: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName} (${p.patientNumber})` }));
  const doctorOptions = doctors.map((d) => ({
    value: d.id,
    label: d.departmentName ? `${d.name} — ${d.departmentName}` : d.name,
  }));

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
      {state?.error && <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</div>}

      {hiddenFields &&
        Object.entries(hiddenFields).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Patient *</label>
          <Select name="patient_id" defaultValue={defaults.patient_id ?? ""} required placeholder="Select patient..." options={patientOptions} />
        </div>
        <div>
          <label className={labelClass}>Doctor *</label>
          <Select name="doctor_id" defaultValue={defaults.doctor_id ?? ""} required placeholder="Select doctor..." options={doctorOptions} />
        </div>

        <div>
          <label className={labelClass}>Date *</label>
          <DatePicker name="appointment_date" defaultValue={defaults.appointment_date ?? ""} required placeholder="Select date..." />
        </div>
        <div>
          <label className={labelClass}>Time *</label>
          <input type="time" name="appointment_time" defaultValue={defaults.appointment_time} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Type</label>
          <Select name="type" defaultValue={defaults.type ?? APPOINTMENT_TYPES[0]} options={TYPE_OPTIONS} />
        </div>

        {showStatus && (
          <div>
            <label className={labelClass}>Status</label>
            <Select name="status" defaultValue={defaults.status ?? "scheduled"} options={STATUS_OPTIONS} />
          </div>
        )}

        <div className="md:col-span-2">
          <label className={labelClass}>Notes</label>
          <textarea name="notes" defaultValue={defaults.notes} rows={3} className={inputClass} />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href={cancelHref} className={btnOutlineSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/actions/medicalRecords";
import { inputClass, labelClass, btnPrimary, btnOutlineSecondary } from "@/components/ui/buttonStyles";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";

export default function MedicalRecordForm({
  action,
  patients,
  doctors,
  defaultPatientId,
  defaultDoctorId,
  appointmentId,
  cancelHref,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  patients: { id: string; patientNumber: string; firstName: string; lastName: string }[];
  doctors: { id: string; name: string }[];
  defaultPatientId?: string;
  defaultDoctorId?: string;
  appointmentId?: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName} (${p.patientNumber})` }));
  const doctorOptions = doctors.map((d) => ({ value: d.id, label: `Dr. ${d.name}` }));

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
          <label className={labelClass}>Doctor *</label>
          <Select name="doctor_id" defaultValue={defaultDoctorId ?? ""} required placeholder="Select doctor..." options={doctorOptions} />
        </div>
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Clinical Details</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className={labelClass}>Diagnosis *</label>
          <input name="diagnosis" required placeholder="e.g. Acute malaria" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Symptoms</label>
          <textarea name="symptoms" rows={2} placeholder="e.g. Fever, headache, joint pain" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Treatment</label>
          <textarea name="treatment" rows={2} placeholder="e.g. Prescribed ACT, advised rest and fluids" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Prescription Notes</label>
          <textarea name="prescription_notes" rows={2} className={inputClass} />
        </div>
        <div className="max-w-xs">
          <label className={labelClass}>Follow-up Date</label>
          <DatePicker name="follow_up_date" placeholder="Select date..." />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving..." : "Save Medical Record"}
        </button>
        <Link href={cancelHref} className={btnOutlineSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

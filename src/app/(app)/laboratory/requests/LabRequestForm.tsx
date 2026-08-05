"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/actions/laboratory";
import { labelClass, btnPrimary, btnOutlineSecondary } from "@/components/ui/buttonStyles";
import Select from "@/components/ui/Select";
import { formatMoney } from "@/lib/format";

export default function LabRequestForm({
  action,
  patients,
  doctors,
  tests,
  defaultPatientId,
  defaultDoctorId,
  appointmentId,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  patients: { id: string; patientNumber: string; firstName: string; lastName: string }[];
  doctors: { id: string; name: string }[];
  tests: { id: string; testName: string; price: number }[];
  defaultPatientId?: string;
  defaultDoctorId?: string;
  appointmentId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName} (${p.patientNumber})` }));
  const doctorOptions = doctors.map((d) => ({ value: d.id, label: d.name }));

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
          <label className={labelClass}>Requesting Doctor *</label>
          <Select name="doctor_id" defaultValue={defaultDoctorId ?? ""} required placeholder="Select doctor..." options={doctorOptions} />
        </div>
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Select Tests</h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {tests.map((t) => (
          <label key={t.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2 text-sm">
            <span className="flex items-center gap-2">
              <input type="checkbox" name="test_id" value={t.id} className="h-4 w-4 rounded border-slate-300 dark:border-white/15" />
              {t.testName}
            </span>
            <span className="text-xs text-slate-400 dark:text-white">{formatMoney(t.price)}</span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving..." : "Save Request"}
        </button>
        <Link href="/laboratory/requests" className={btnOutlineSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

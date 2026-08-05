"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/actions/departments";
import { inputClass, labelClass, btnPrimary, btnOutlineSecondary } from "@/components/ui/buttonStyles";
import Select from "@/components/ui/Select";

export default function DepartmentForm({
  action,
  doctors,
  defaults = {},
  submitLabel,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  doctors: { id: string; name: string }[];
  defaults?: { name?: string; description?: string; head_doctor_id?: string };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const doctorOptions = [{ value: "", label: "Unassigned" }, ...doctors.map((d) => ({ value: d.id, label: d.name }))];

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
      {state?.error && <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className={labelClass}>Department Name *</label>
          <input name="name" defaultValue={defaults.name} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Head of Department</label>
          <Select name="head_doctor_id" defaultValue={defaults.head_doctor_id ?? ""} options={doctorOptions} />
        </div>
        <div className="md:col-span-3">
          <label className={labelClass}>Description</label>
          <textarea name="description" defaultValue={defaults.description} rows={3} className={inputClass} />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href="/departments" className={btnOutlineSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

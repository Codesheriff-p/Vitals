"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/actions/doctors";
import { inputClass, labelClass, btnPrimary, btnOutlineSecondary } from "@/components/ui/buttonStyles";
import Select from "@/components/ui/Select";
import ImageUpload from "@/components/ui/ImageUpload";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export interface DoctorDefaults {
  name?: string;
  email?: string;
  specialization?: string;
  department_id?: string;
  qualification?: string;
  phone?: string;
  status?: string;
  photo?: string | null;
}

export default function DoctorForm({
  action,
  departments,
  defaults = {},
  submitLabel,
  cancelHref,
  showPassword,
  showStatus,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  departments: { id: string; name: string }[];
  defaults?: DoctorDefaults;
  submitLabel: string;
  cancelHref: string;
  showPassword?: boolean;
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const departmentOptions = [{ value: "", label: "Unassigned" }, ...departments.map((d) => ({ value: d.id, label: d.name }))];

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
      {state?.error && <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</div>}

      <div className="mb-5">
        <ImageUpload name="photo" label="Doctor Photo" defaultPreview={defaults.photo} personName={defaults.name} />
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Account Details</h2>
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input name="name" defaultValue={defaults.name} placeholder="Dr. John Doe" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" name="email" defaultValue={defaults.email} required className={inputClass} />
        </div>
        {showPassword && (
          <div>
            <label className={labelClass}>Temporary Password *</label>
            <input type="password" name="password" minLength={6} required className={inputClass} />
            <p className="mt-1 text-xs text-slate-400 dark:text-white">Minimum 6 characters. Can be changed after login.</p>
          </div>
        )}
        {showStatus && (
          <div>
            <label className={labelClass}>Account Status</label>
            <Select name="status" defaultValue={defaults.status ?? "active"} options={STATUS_OPTIONS} />
          </div>
        )}
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Professional Details</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Specialization *</label>
          <input
            name="specialization"
            defaultValue={defaults.specialization}
            placeholder="e.g. Cardiologist"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Department</label>
          <Select name="department_id" defaultValue={defaults.department_id ?? ""} options={departmentOptions} />
        </div>
        <div>
          <label className={labelClass}>Qualification</label>
          <input name="qualification" defaultValue={defaults.qualification} placeholder="e.g. MBBS, FWACS" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input name="phone" defaultValue={defaults.phone} className={inputClass} />
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

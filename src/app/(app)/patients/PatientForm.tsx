"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/actions/patients";
import { inputClass, labelClass, btnPrimary, btnOutlineSecondary } from "@/components/ui/buttonStyles";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import ImageUpload from "@/components/ui/ImageUpload";
import { UserRound } from "lucide-react";

const TODAY = new Date().toISOString().slice(0, 10);

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];
const BLOOD_GROUP_OPTIONS = [
  { value: "", label: "Unknown" },
  ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg })),
];

export interface PatientDefaults {
  first_name?: string;
  last_name?: string;
  dob?: string;
  gender?: string;
  blood_group?: string;
  phone?: string;
  email?: string;
  address?: string;
  next_of_kin?: string;
  next_of_kin_phone?: string;
  assigned_doctor_id?: string;
  photo?: string | null;
}

export default function PatientForm({
  action,
  doctors,
  defaults = {},
  submitLabel,
  cancelHref,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  doctors: { id: string; name: string }[];
  defaults?: PatientDefaults;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const doctorOptions = [
    { value: "", label: "Not yet assigned" },
    ...doctors.map((d) => ({ value: d.id, label: `Dr. ${d.name}` })),
  ];

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
      {state?.error && <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</div>}

      <div className="mb-5">
        <ImageUpload
          name="photo"
          label="Patient Photo"
          defaultPreview={defaults.photo}
          personName={`${defaults.first_name ?? ""} ${defaults.last_name ?? ""}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>First Name *</label>
          <input name="first_name" defaultValue={defaults.first_name} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Last Name *</label>
          <input name="last_name" defaultValue={defaults.last_name} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Date of Birth</label>
          <DatePicker name="dob" defaultValue={defaults.dob ?? ""} max={TODAY} placeholder="Select date of birth..." />
        </div>
        <div>
          <label className={labelClass}>Gender *</label>
          <Select name="gender" defaultValue={defaults.gender ?? ""} required placeholder="Select..." options={GENDER_OPTIONS} />
        </div>

        <div>
          <label className={labelClass}>Blood Group</label>
          <Select name="blood_group" defaultValue={defaults.blood_group ?? ""} options={BLOOD_GROUP_OPTIONS} />
        </div>
        <div>
          <label className={labelClass}>Phone *</label>
          <input name="phone" defaultValue={defaults.phone} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input type="email" name="email" defaultValue={defaults.email} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Address</label>
          <textarea name="address" defaultValue={defaults.address} rows={2} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Next of Kin</label>
          <input name="next_of_kin" defaultValue={defaults.next_of_kin} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Next of Kin Phone</label>
          <input name="next_of_kin_phone" defaultValue={defaults.next_of_kin_phone} className={inputClass} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Assigned Doctor</label>
          <Select
            name="assigned_doctor_id"
            defaultValue={defaults.assigned_doctor_id ?? ""}
            icon={UserRound}
            options={doctorOptions}
          />
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

"use client";

import { useActionState } from "react";
import type { FormState } from "@/actions/profile";
import { inputClass, labelClass, btnPrimary } from "@/components/ui/buttonStyles";
import DatePicker from "@/components/ui/DatePicker";
import ImageUpload from "@/components/ui/ImageUpload";

const TODAY = new Date().toISOString().slice(0, 10);

export interface ProfileDefaults {
  name: string;
  email: string;
  role: string;
  phone?: string;
  dob?: string;
  photo?: string | null;
}

export default function ProfileForm({
  action,
  defaults,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  defaults: ProfileDefaults;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
      {state?.error && <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</div>}

      <div className="mb-5">
        <ImageUpload name="photo" label="Profile Photo" defaultPreview={defaults.photo} personName={defaults.name} />
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">
        Personal Details
      </h2>
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input name="name" defaultValue={defaults.name} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" name="email" defaultValue={defaults.email} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input name="phone" defaultValue={defaults.phone} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date of Birth</label>
          <DatePicker name="dob" defaultValue={defaults.dob ?? ""} max={TODAY} placeholder="Select date of birth..." />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <input value={defaults.role} disabled className={`${inputClass} capitalize opacity-60`} />
        </div>
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">
        Change Password
      </h2>
      <p className="mb-3 text-xs text-slate-400 dark:text-white">Leave blank to keep your current password.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>Current Password</label>
          <input type="password" name="currentPassword" autoComplete="current-password" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>New Password</label>
          <input type="password" name="newPassword" minLength={6} autoComplete="new-password" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Confirm New Password</label>
          <input type="password" name="confirmNewPassword" minLength={6} autoComplete="new-password" className={inputClass} />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

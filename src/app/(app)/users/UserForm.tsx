"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/actions/users";
import { ALL_ROLES, roleLabel } from "@/lib/userRoles";
import { inputClass, labelClass, btnPrimary, btnOutlineSecondary } from "@/components/ui/buttonStyles";
import Select from "@/components/ui/Select";
import ImageUpload from "@/components/ui/ImageUpload";

const ROLE_OPTIONS = ALL_ROLES.map((r) => ({ value: r, label: roleLabel(r) }));
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export interface UserDefaults {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  photo?: string | null;
}

export default function UserForm({
  action,
  defaults = {},
  submitLabel,
  showStatus,
  passwordRequired,
}: {
  action: (prevState: FormState | undefined, formData: FormData) => Promise<FormState>;
  defaults?: UserDefaults;
  submitLabel: string;
  showStatus?: boolean;
  passwordRequired?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
      {state?.error && <div className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</div>}

      <div className="mb-5">
        <ImageUpload name="photo" label="Profile Photo" defaultPreview={defaults.photo} personName={defaults.name} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input name="name" defaultValue={defaults.name} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" name="email" defaultValue={defaults.email} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{passwordRequired ? "Password *" : "New Password"}</label>
          <input type="password" name="password" minLength={6} required={passwordRequired} className={inputClass} />
          {!passwordRequired && <p className="mt-1 text-xs text-slate-400 dark:text-white">Leave blank to keep the current password.</p>}
        </div>
        <div>
          <label className={labelClass}>Role *</label>
          <Select name="role" defaultValue={defaults.role ?? ""} required placeholder="Select..." options={ROLE_OPTIONS} />
        </div>
        {showStatus && (
          <div>
            <label className={labelClass}>Status</label>
            <Select name="status" defaultValue={defaults.status ?? "active"} options={STATUS_OPTIONS} />
          </div>
        )}
      </div>

      <p className="mt-4 rounded-lg bg-trace-deep/5 px-3 py-2 text-xs text-slate-500 dark:bg-trace/5 dark:text-white">
        This creates a bare login account. To add a doctor or staff member with a full professional profile, use the{" "}
        <Link href="/doctors/add" className="text-trace-deep dark:text-trace underline">
          Doctors
        </Link>{" "}
        or{" "}
        <Link href="/staff/add" className="text-trace-deep dark:text-trace underline">
          Staff
        </Link>{" "}
        module instead.
      </p>

      <div className="mt-5 flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href="/users" className={btnOutlineSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

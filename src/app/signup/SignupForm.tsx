"use client";

import { useActionState } from "react";
import { User, Mail, UserCog } from "lucide-react";
import { signup, type SignupState } from "@/actions/auth";
import Select from "@/components/ui/Select";
import { SELF_SERVICE_ROLES, roleLabel } from "@/lib/userRoles";
import { authInputClass, authBtnPrimary, authLabelClass, authIconClass, authErrorClass } from "@/components/auth/authStyles";
import PasswordInput from "@/components/auth/PasswordInput";

const initialState: SignupState = {};

const ROLE_OPTIONS = SELF_SERVICE_ROLES.map((r) => ({ value: r, label: roleLabel(r) }));

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        {state?.error && <div className={authErrorClass}>{state.error}</div>}

        <div>
          <label htmlFor="name" className={authLabelClass}>
            Full Name
          </label>
          <div className="relative">
            <User size={16} className={`pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 ${authIconClass}`} />
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              autoComplete="name"
              placeholder="Jane Doe"
              className={`${authInputClass} pl-9`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={authLabelClass}>
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className={`pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 ${authIconClass}`} />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@hms.com"
              className={`${authInputClass} pl-9`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="role" className={authLabelClass}>
            Role
          </label>
          <Select id="role" name="role" required icon={UserCog} placeholder="Select your role..." options={ROLE_OPTIONS} />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="password" className={authLabelClass}>
              Password
            </label>
            <PasswordInput id="password" name="password" autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="confirm_password" className={authLabelClass}>
              Confirm Password
            </label>
            <PasswordInput id="confirm_password" name="confirm_password" autoComplete="new-password" />
          </div>
        </div>

        <button type="submit" disabled={pending} className={`${authBtnPrimary} w-full py-2.5`}>
          {pending ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}

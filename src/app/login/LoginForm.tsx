"use client";

import { useActionState, useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { login, type LoginState } from "@/actions/auth";
import { authInputClass, authBtnPrimary, authLabelClass, authIconClass, authErrorClass } from "@/components/auth/authStyles";
import PasswordInput from "@/components/auth/PasswordInput";

const initialState: LoginState = {};
const ERROR_DISMISS_MS = 5000;

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [dismissed, setDismissed] = useState<LoginState | null>(null);

  useEffect(() => {
    if (!state?.error) return;
    const timer = setTimeout(() => setDismissed(state), ERROR_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const showError = state?.error && dismissed !== state;

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        {showError && <div className={authErrorClass}>{state.error}</div>}

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
              autoFocus
              autoComplete="email"
              placeholder="name@hms.com"
              className={`${authInputClass} pl-9`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className={authLabelClass}>
            Password
          </label>
          <PasswordInput id="password" name="password" autoComplete="current-password" />
        </div>

        <button type="submit" disabled={pending} className={`${authBtnPrimary} w-full py-2.5`}>
          {pending ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

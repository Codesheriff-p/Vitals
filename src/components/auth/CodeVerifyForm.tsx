"use client";

import { useActionState, useState, useTransition } from "react";
import type { VerifyState } from "@/actions/auth";
import {
  authInputClass,
  authBtnPrimary,
  authLinkClass,
  authLabelClass,
  authMutedClass,
  authErrorClass,
} from "@/components/auth/authStyles";

const initialState: VerifyState = {};

export default function CodeVerifyForm({
  email,
  leadText,
  trailText,
  submitLabel,
  pendingLabel,
  verifyAction,
  resendAction,
}: {
  email: string;
  leadText: string;
  trailText: string;
  submitLabel: string;
  pendingLabel: string;
  verifyAction: (prevState: VerifyState | undefined, formData: FormData) => Promise<VerifyState>;
  resendAction: () => Promise<VerifyState>;
}) {
  const [state, formAction, pending] = useActionState(verifyAction, initialState);
  const [resendState, setResendState] = useState<VerifyState | null>(null);
  const [isResending, startResend] = useTransition();

  function handleResend() {
    setResendState(null);
    startResend(async () => {
      const result = await resendAction();
      setResendState(result);
    });
  }

  return (
    <div className="space-y-5">
      <p className={`text-center text-sm ${authMutedClass}`}>
        {leadText} <span className="font-semibold text-slate-700 dark:text-white">{email}</span>. {trailText}
      </p>

      <form action={formAction} className="space-y-4">
        {state?.error && <div className={authErrorClass}>{state.error}</div>}

        <div>
          <label htmlFor="code" className={authLabelClass}>
            Verification Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoFocus
            autoComplete="one-time-code"
            placeholder="000000"
            className={`${authInputClass} text-center font-mono text-lg tracking-[0.5em]`}
          />
        </div>

        <button type="submit" disabled={pending} className={`${authBtnPrimary} w-full py-2.5`}>
          {pending ? pendingLabel : submitLabel}
        </button>
      </form>

      <div className="text-center text-sm">
        {resendState?.resent ? (
          <span className="text-success dark:text-success-bright">Code resent — check your email.</span>
        ) : resendState?.error ? (
          <span className="text-danger dark:text-danger-bright">{resendState.error}</span>
        ) : (
          <button type="button" onClick={handleResend} disabled={isResending} className={`${authLinkClass} disabled:opacity-60`}>
            {isResending ? "Resending..." : "Resend code"}
          </button>
        )}
      </div>
    </div>
  );
}

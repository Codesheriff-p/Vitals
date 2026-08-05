"use client";

import { verifySignup, resendSignupCode } from "@/actions/auth";
import CodeVerifyForm from "@/components/auth/CodeVerifyForm";

export default function VerifyForm({ email }: { email: string }) {
  return (
    <CodeVerifyForm
      email={email}
      leadText="We sent a 6-digit code to"
      trailText="Enter it below to verify your email."
      submitLabel="Verify Email"
      pendingLabel="Verifying..."
      verifyAction={verifySignup}
      resendAction={resendSignupCode}
    />
  );
}

"use client";

import { verifyLogin, resendLoginCode } from "@/actions/auth";
import CodeVerifyForm from "@/components/auth/CodeVerifyForm";

export default function LoginVerifyForm({ email }: { email: string }) {
  return (
    <CodeVerifyForm
      email={email}
      leadText="We sent a 6-digit code to"
      trailText="Enter it below to sign in."
      submitLabel="Verify & Sign In"
      pendingLabel="Verifying..."
      verifyAction={verifyLogin}
      resendAction={resendLoginCode}
    />
  );
}

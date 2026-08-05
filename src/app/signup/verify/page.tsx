import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getPendingSignup } from "@/lib/auth";
import AuthShell from "@/components/auth/AuthShell";
import { authLinkClass, authMutedClass } from "@/components/auth/authStyles";
import VerifyForm from "./VerifyForm";

export const metadata = { title: "Verify Email - VITALS HMS" };

export default async function VerifyPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const pending = await getPendingSignup();
  if (!pending) redirect("/signup");

  return (
    <AuthShell
      eyebrow="Confirm your email"
      subtitle="Verify to continue"
      switchLink={
        <span className={authMutedClass}>
          Wrong email?{" "}
          <Link href="/signup" className={authLinkClass}>
            Start over
          </Link>
        </span>
      }
    >
      <VerifyForm email={pending.email} />
    </AuthShell>
  );
}

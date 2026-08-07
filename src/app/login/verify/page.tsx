import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, getPendingLogin } from "@/lib/auth";
import AuthShell from "@/components/auth/AuthShell";
import { authLinkClass, authMutedClass } from "@/components/auth/authStyles";
import LoginVerifyForm from "./LoginVerifyForm";

export const metadata = { title: "Verify Sign-in - VITALS HMS" };

export default async function LoginVerifyPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const pending = await getPendingLogin();
  if (!pending) redirect("/login");

  return (
    <AuthShell
      eyebrow="Confirm it's you"
      subtitle="Verify to continue"
      switchLink={
        <span className={authMutedClass}>
          Wrong account?{" "}
          <Link href="/login" className={authLinkClass}>
            Start over
          </Link>
        </span>
      }
    >
      <LoginVerifyForm email={pending.email} />
    </AuthShell>
  );
}

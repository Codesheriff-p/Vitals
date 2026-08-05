import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import AuthShell from "@/components/auth/AuthShell";
import { authLinkClass, authMutedClass } from "@/components/auth/authStyles";
import SignupForm from "./SignupForm";

export const metadata = { title: "Request Account - VITALS HMS" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell
      eyebrow="Staff access request"
      subtitle="Request a staff account"
      switchLink={
        <span className={authMutedClass}>
          Already have an account?{" "}
          <Link href="/login" className={authLinkClass}>
            Sign in
          </Link>
        </span>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}

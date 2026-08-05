import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import AuthShell from "@/components/auth/AuthShell";
import { authLinkClass, authMutedClass } from "@/components/auth/authStyles";
import FlashMessages from "@/components/ui/FlashMessages";
import LoginForm from "./LoginForm";

export const metadata = { title: "Login - VITALS HMS" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <AuthShell
      switchLink={
        <span className={authMutedClass}>
          New here?{" "}
          <Link href="/signup" className={authLinkClass}>
            Request an account
          </Link>
        </span>
      }
    >
      <FlashMessages searchParams={params} />
      <LoginForm />
    </AuthShell>
  );
}

import Link from "next/link";
import { SignpostBig } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { btnPrimary } from "@/components/ui/buttonStyles";

export default async function NotFound() {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-light-bg p-5 dark:bg-ink">
      <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-screen">
        <SignpostBig size={56} className="mx-auto text-slate-400 dark:text-white" />
        <h1 className="mt-4 mb-1 text-2xl font-bold text-slate-900 dark:text-white">404</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-white">The page you are looking for does not exist.</p>
        <Link href={user ? "/dashboard" : "/login"} className={btnPrimary}>
          Back to {user ? "Dashboard" : "Login"}
        </Link>
      </div>
    </div>
  );
}

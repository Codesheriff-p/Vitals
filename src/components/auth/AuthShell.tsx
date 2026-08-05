import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, HeartPulse } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function AuthShell({
  eyebrow = "Secure staff sign-in",
  subtitle = "Hospital Management System",
  children,
  switchLink,
}: {
  eyebrow?: string;
  subtitle?: string;
  children: ReactNode;
  switchLink: ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-light-bg p-5 dark:bg-ink">
      <div className="monitor-screen monitor-screen-adaptive pointer-events-none absolute inset-0" />

      <Link
        href="/"
        className="absolute top-5 left-5 z-10 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-900 sm:top-8 sm:left-8 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to VITALS
      </Link>

      <div className="absolute top-5 right-5 z-10 sm:top-8 sm:right-8">
        <ThemeToggle className="text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* ambient screen glow behind the card */}
        <div
          className="absolute -inset-6 -z-10 rounded-[2rem] bg-trace-deep/10 blur-3xl dark:bg-trace/10"
          aria-hidden="true"
        />

        <div className="relative rounded-3xl bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-black/5 dark:bg-screen dark:shadow-black/50 dark:ring-white/10">
          {/* Decoration layer: clipped to the card's rounded corners so the
              gradient bar can't poke past them. Kept separate from the
              content below, which must stay unclipped for dropdown panels
              (e.g. the role Select) to be able to overflow the card. */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-trace to-secondary" />
          </div>

          <div className="relative p-9">
            {/* viewfinder corner marks, echoing the monitor motif */}
            <span
              className="absolute top-4 left-4 h-3 w-3 rounded-tl-sm border-t-2 border-l-2 border-trace-deep/40 dark:border-trace/40"
              aria-hidden="true"
            />
            <span
              className="absolute top-4 right-4 h-3 w-3 rounded-tr-sm border-t-2 border-r-2 border-trace-deep/40 dark:border-trace/40"
              aria-hidden="true"
            />
            <span
              className="absolute bottom-4 left-4 h-3 w-3 rounded-bl-sm border-b-2 border-l-2 border-trace-deep/40 dark:border-trace/40"
              aria-hidden="true"
            />
            <span
              className="absolute right-4 bottom-4 h-3 w-3 rounded-br-sm border-r-2 border-b-2 border-trace-deep/40 dark:border-trace/40"
              aria-hidden="true"
            />

            <div className="mb-6 text-center">
              <Link
                href="/"
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-trace shadow-lg shadow-trace-deep/20 transition-transform hover:scale-105 dark:bg-trace/15 dark:shadow-trace/20"
              >
                <HeartPulse size={26} />
              </Link>
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase dark:text-white/50">
                {eyebrow}
              </p>
              <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">VITALS HMS</h1>
              <p className="text-sm text-slate-500 dark:text-white/60">{subtitle}</p>
            </div>

            {children}

            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm dark:border-white/10">{switchLink}</div>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-xs text-slate-400 dark:text-white/30">
          &copy; {year} VITALS HMS &mdash; internal hospital system.
        </p>
      </div>
    </div>
  );
}

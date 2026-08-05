import Link from "next/link";
import type { ReactNode } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

export default function PageHeader({
  crumbs,
  title,
  action,
}: {
  crumbs: Crumb[];
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-5 dark:border-white/10">
      <div>
        <p className="mb-1.5 flex items-center gap-1 font-mono text-[11px] tracking-wide text-slate-400 uppercase dark:text-white">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-300 dark:text-white">/</span>}
              {c.href ? (
                <Link href={c.href} className="transition-colors hover:text-trace-deep dark:hover:text-trace">
                  {c.label}
                </Link>
              ) : (
                c.label
              )}
            </span>
          ))}
        </p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      </div>
      {action}
    </div>
  );
}

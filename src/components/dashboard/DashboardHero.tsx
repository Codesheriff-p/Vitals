export interface HeroStat {
  value: string | number;
  label: string;
}

const HONORIFICS = new Set(["dr", "dr.", "prof", "prof.", "mr", "mr.", "mrs", "mrs.", "ms", "ms."]);

/** First name for the greeting, keeping an honorific attached to it so doctors
    are welcomed back as "Dr. James" rather than the bare "Dr.". */
function greetingName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1 && HONORIFICS.has(parts[0].toLowerCase())) {
    return `${parts[0]} ${parts[1]}`;
  }
  return parts[0] ?? name;
}

export default function DashboardHero({ name, stats }: { name: string; stats?: HeroStat[] }) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03] sm:p-7 dark:border-white/10 dark:bg-ink dark:shadow-black/20">
      <div className="monitor-screen pointer-events-none absolute inset-0 hidden dark:block" />

      <div className="relative">
        <p className="pulse-dot inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-trace-deep uppercase dark:text-trace">
          System status &middot; Live
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Welcome back, {greetingName(name)}
        </h1>

        {stats && stats.length > 0 && (
          <dl className="mt-5 flex flex-wrap gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 dark:border-white/10 dark:bg-white/10">
            {stats.map((s) => (
              <div key={s.label} className="min-w-[120px] flex-1 bg-white px-4 py-3 dark:bg-ink">
                <dd className="font-mono text-xl font-medium text-trace-deep sm:text-2xl dark:text-trace">{s.value}</dd>
                <dt className="mt-0.5 text-[11px] tracking-wide text-slate-500 uppercase dark:text-white">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

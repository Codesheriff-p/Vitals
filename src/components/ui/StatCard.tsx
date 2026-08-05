import type { LucideIcon } from "lucide-react";
import { cardClass } from "./buttonStyles";

const COLOR_CLASS = {
  primary: "bg-trace-deep/10 text-trace-deep dark:bg-trace/10 dark:text-trace",
  secondary: "bg-secondary/10 text-secondary dark:bg-white/10 dark:text-white",
  success: "bg-success/10 text-success dark:bg-success-bright/10 dark:text-success-bright",
  warning: "bg-warning/10 text-warning dark:bg-white/10 dark:text-white",
  danger: "bg-danger/10 text-danger dark:bg-danger-bright/10 dark:text-danger-bright",
} as const;

export default function StatCard({
  icon: Icon,
  label,
  value,
  color = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: keyof typeof COLOR_CLASS;
}) {
  return (
    <div className={`flex h-full items-center gap-4 transition-shadow hover:shadow-md ${cardClass}`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${COLOR_CLASS[color]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <div className="font-mono text-2xl leading-tight font-semibold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        <div className="truncate text-sm text-slate-500 dark:text-white">{label}</div>
      </div>
    </div>
  );
}

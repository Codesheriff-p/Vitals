import type { LucideIcon } from "lucide-react";

export default function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center text-slate-400 dark:text-white">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-light-bg text-slate-300 dark:bg-white/5 dark:text-white">
        <Icon size={26} />
      </span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

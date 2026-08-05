import { btnOutline } from "@/components/ui/buttonStyles";
import DatePicker from "@/components/ui/DatePicker";

export default function DateRangeFilter({ action, from, to }: { action: string; from?: string; to?: string }) {
  return (
    <form
      action={action}
      method="GET"
      className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-screen"
    >
      <div>
        <label className="mb-1 block text-xs text-slate-500 dark:text-white">From</label>
        <DatePicker name="from" defaultValue={from ?? ""} max={to} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500 dark:text-white">To</label>
        <DatePicker name="to" defaultValue={to ?? ""} min={from} />
      </div>
      <button type="submit" className={btnOutline}>
        Apply
      </button>
      {(from || to) && (
        <a href={action} className="flex items-center px-1 text-sm text-slate-500 dark:text-white hover:text-trace-deep dark:hover:text-trace">
          Clear
        </a>
      )}
    </form>
  );
}

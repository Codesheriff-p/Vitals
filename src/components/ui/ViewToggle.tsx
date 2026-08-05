import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";

export default function ViewToggle({
  basePath,
  current,
  searchParams,
}: {
  basePath: string;
  current: "cards" | "table";
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  function hrefFor(view: "cards" | "table") {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "view") continue;
      if (typeof value === "string" && value) sp.set(key, value);
    }
    sp.set("view", view);
    return `${basePath}?${sp.toString()}`;
  }

  const base = "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors";
  const active = "bg-trace text-ink";
  const inactive = "text-slate-500 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10";

  return (
    <div className="inline-flex rounded-lg border border-slate-200/80 bg-white p-1 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
      <Link href={hrefFor("cards")} className={`${base} ${current === "cards" ? active : inactive}`}>
        <LayoutGrid size={14} /> Cards
      </Link>
      <Link href={hrefFor("table")} className={`${base} ${current === "table" ? active : inactive}`}>
        <List size={14} /> Table
      </Link>
    </div>
  );
}

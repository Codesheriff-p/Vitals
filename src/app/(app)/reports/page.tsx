import Link from "next/link";
import { Users, CalendarCheck2, Wallet, Pill, FlaskConical, UserCog, ChevronRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = { title: "Reports - VITALS HMS" };

const REPORTS = [
  { href: "/reports/patients", icon: Users, title: "Patient Registrations", description: "Registration trends, gender and blood group breakdowns." },
  { href: "/reports/appointments", icon: CalendarCheck2, title: "Appointments", description: "Status breakdown, appointments by department and doctor." },
  { href: "/reports/revenue", icon: Wallet, title: "Revenue & Billing", description: "Collected revenue, payment methods, outstanding balances." },
  { href: "/reports/pharmacy", icon: Pill, title: "Pharmacy & Inventory", description: "Stock levels, inventory value, most dispensed drugs." },
  { href: "/reports/laboratory", icon: FlaskConical, title: "Laboratory", description: "Request status breakdown and most requested tests." },
  { href: "/reports/staff", icon: UserCog, title: "Staff & Doctor Performance", description: "Appointments handled per doctor, staff composition." },
];

export default async function ReportsPage() {
  await requireRole(["admin"]);

  return (
    <div>
      <PageHeader crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Reports" }]} title="Reports" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-trace-deep/40 hover:shadow-md dark:hover:border-trace/40"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-trace-deep/10 text-trace-deep dark:bg-trace/10 dark:text-trace">
              <r.icon size={22} />
            </div>
            <h2 className="mb-1 font-semibold text-slate-800 dark:text-white">{r.title}</h2>
            <p className="mb-3 flex-1 text-sm text-slate-500 dark:text-white">{r.description}</p>
            <span className="flex items-center gap-1 text-sm font-medium text-trace-deep dark:text-trace">
              View report <ChevronRight size={16} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

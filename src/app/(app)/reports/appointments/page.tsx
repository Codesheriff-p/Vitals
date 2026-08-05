import { requireRole } from "@/lib/auth";
import { getAppointmentsReport } from "@/lib/reports";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import DateRangeFilter from "@/components/reports/DateRangeFilter";
import { CalendarCheck2 } from "lucide-react";

export const metadata = { title: "Appointments Report - VITALS HMS" };

export default async function AppointmentsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;

  const report = await getAppointmentsReport(from, to);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Reports", href: "/reports" }, { label: "Appointments" }]}
        title="Appointments Report"
      />

      <DateRangeFilter action="/reports/appointments" from={from} to={to} />

      <div className="mb-4">
        <StatCard icon={CalendarCheck2} label="Total Appointments" value={report.total} color="primary" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">By Status</h2>
          <ul className="space-y-1 text-sm">
            {report.statusBreakdown.map((s) => (
              <li key={s.status} className="flex justify-between border-b border-slate-100 dark:border-white/5 py-1 capitalize">
                <span>{s.status}</span>
                <span className="font-semibold">{s.total}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">By Department</h2>
          <ul className="space-y-1 text-sm">
            {report.byDepartment.map((d) => (
              <li key={d.department} className="flex justify-between border-b border-slate-100 dark:border-white/5 py-1">
                <span>{d.department}</span>
                <span className="font-semibold">{d.total}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Appointments by Doctor</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                <th className="py-2 pr-3">Doctor</th>
                <th className="py-2 pr-3">Total Appointments</th>
              </tr>
            </thead>
            <tbody>
              {report.byDoctor.map((d) => (
                <tr key={d.doctor} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                  <td className="py-2 pr-3">{d.doctor}</td>
                  <td className="py-2 pr-3 font-semibold">{d.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

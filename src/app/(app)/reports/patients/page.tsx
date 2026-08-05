import { requireRole } from "@/lib/auth";
import { getPatientsReport } from "@/lib/reports";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import DateRangeFilter from "@/components/reports/DateRangeFilter";
import { Users, UserPlus } from "lucide-react";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Patients Report - VITALS HMS" };

export default async function PatientsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;

  const report = await getPatientsReport(from, to);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Reports", href: "/reports" }, { label: "Patients" }]}
        title="Patient Registrations Report"
      />

      <DateRangeFilter action="/reports/patients" from={from} to={to} />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={Users} label="Total Patients" value={report.total} color="primary" />
        <StatCard icon={UserPlus} label={from && to ? "Registered in Range" : "Registered (all time)"} value={report.newInRange} color="success" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">By Gender</h2>
          <ul className="space-y-1 text-sm">
            {report.genderBreakdown.map((g) => (
              <li key={g.gender} className="flex justify-between border-b border-slate-100 dark:border-white/5 py-1 capitalize">
                <span>{g.gender}</span>
                <span className="font-semibold">{g.total}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">By Blood Group</h2>
          <ul className="space-y-1 text-sm">
            {report.bloodGroupBreakdown.map((b) => (
              <li key={b.bloodGroup} className="flex justify-between border-b border-slate-100 dark:border-white/5 py-1">
                <span>{b.bloodGroup}</span>
                <span className="font-semibold">{b.total}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Recent Registrations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                <th className="py-2 pr-3">Patient #</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Gender</th>
                <th className="py-2 pr-3">Phone</th>
                <th className="py-2 pr-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {report.recent.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                  <td className="py-2 pr-3">{p.patient_number}</td>
                  <td className="py-2 pr-3">
                    {p.first_name} {p.last_name}
                  </td>
                  <td className="py-2 pr-3 capitalize">{p.gender}</td>
                  <td className="py-2 pr-3">{p.phone}</td>
                  <td className="py-2 pr-3">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import { requireRole } from "@/lib/auth";
import { getStaffReport } from "@/lib/reports";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import { BadgeCheck, UserCog } from "lucide-react";

export const metadata = { title: "Staff Report - VITALS HMS" };

function roleLabel(r: string) {
  return r.replace("_", " ");
}

export default async function StaffReportPage() {
  await requireRole(["admin"]);
  const report = await getStaffReport();

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Reports", href: "/reports" }, { label: "Staff" }]}
        title="Staff & Doctor Performance Report"
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={BadgeCheck} label="Active Doctors" value={report.activeDoctors} color="primary" />
        <StatCard icon={UserCog} label="Active Staff" value={report.activeStaff} color="success" />
      </div>

      <div className="mb-4">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Staff Composition by Role</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {report.staffByRole.map((s) => (
              <li key={s.role} className="rounded-lg border border-slate-100 dark:border-white/5 px-3 py-2 text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{s.total}</div>
                <div className="text-xs capitalize text-slate-500 dark:text-white">{roleLabel(s.role)}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Appointments Handled per Doctor</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                <th className="py-2 pr-3">Doctor</th>
                <th className="py-2 pr-3">Department</th>
                <th className="py-2 pr-3">Total Appointments</th>
              </tr>
            </thead>
            <tbody>
              {report.doctorPerformance.map((d, i) => (
                <tr key={`${d.doctor}-${i}`} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                  <td className="py-2 pr-3">{d.doctor}</td>
                  <td className="py-2 pr-3">{d.department}</td>
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

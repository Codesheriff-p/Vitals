import { requireRole } from "@/lib/auth";
import { getLaboratoryReport } from "@/lib/reports";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import { FlaskConical, ClipboardList } from "lucide-react";

export const metadata = { title: "Laboratory Report - VITALS HMS" };

export default async function LaboratoryReportPage() {
  await requireRole(["admin"]);
  const report = await getLaboratoryReport();

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Reports", href: "/reports" }, { label: "Laboratory" }]}
        title="Laboratory Report"
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={FlaskConical} label="Total Lab Requests" value={report.totalRequests} color="primary" />
        <StatCard icon={ClipboardList} label="Total Tests Requested" value={report.totalItems} color="secondary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Requests by Status</h2>
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
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Most Requested Tests</h2>
          <ul className="space-y-1 text-sm">
            {report.topTests.map((t) => (
              <li key={t.testName} className="flex justify-between border-b border-slate-100 dark:border-white/5 py-1">
                <span>{t.testName}</span>
                <span className="font-semibold">{t.total}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

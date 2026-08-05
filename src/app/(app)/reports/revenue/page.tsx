import { requireRole } from "@/lib/auth";
import { getRevenueReport } from "@/lib/reports";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import DateRangeFilter from "@/components/reports/DateRangeFilter";
import { Wallet, Receipt, TriangleAlert } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata = { title: "Revenue Report - VITALS HMS" };

export default async function RevenueReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;

  const report = await getRevenueReport(from, to);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Reports", href: "/reports" }, { label: "Revenue" }]}
        title="Revenue & Billing Report"
      />

      <DateRangeFilter action="/reports/revenue" from={from} to={to} />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Revenue Collected" value={formatMoney(report.totalRevenue)} color="success" />
        <StatCard icon={Receipt} label="Payments Recorded" value={report.paymentCount} color="primary" />
        <StatCard icon={TriangleAlert} label="Outstanding Balance" value={formatMoney(report.outstanding)} color="danger" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Revenue by Payment Method</h2>
          <ul className="space-y-1 text-sm">
            {report.byMethod.map((m) => (
              <li key={m.method} className="flex justify-between border-b border-slate-100 dark:border-white/5 py-1 capitalize">
                <span>{m.method}</span>
                <span className="font-semibold">{formatMoney(m.total)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Revenue by Category</h2>
          <ul className="space-y-1 text-sm">
            {report.byCategory.map((c) => (
              <li key={c.category} className="flex justify-between border-b border-slate-100 dark:border-white/5 py-1 capitalize">
                <span>{c.category}</span>
                <span className="font-semibold">{formatMoney(c.total)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                <th className="py-2 pr-3">Bill #</th>
                <th className="py-2 pr-3">Patient</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Method</th>
                <th className="py-2 pr-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {report.recentPayments.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                  <td className="py-2 pr-3">{p.bill_number}</td>
                  <td className="py-2 pr-3">
                    {p.patient_first_name} {p.patient_last_name}
                  </td>
                  <td className="py-2 pr-3">{formatMoney(p.amount)}</td>
                  <td className="py-2 pr-3 capitalize">{p.payment_method}</td>
                  <td className="py-2 pr-3">{formatDate(p.payment_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

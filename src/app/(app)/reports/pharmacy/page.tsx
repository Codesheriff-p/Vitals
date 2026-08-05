import { requireRole } from "@/lib/auth";
import { getPharmacyReport } from "@/lib/reports";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Pill, Wallet, TriangleAlert, CheckCircle2 } from "lucide-react";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Pharmacy Report - VITALS HMS" };

export default async function PharmacyReportPage() {
  await requireRole(["admin"]);
  const report = await getPharmacyReport();

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Reports", href: "/reports" }, { label: "Pharmacy" }]}
        title="Pharmacy & Inventory Report"
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Pill} label="Drugs in Catalog" value={report.drugCount} color="primary" />
        <StatCard icon={Wallet} label="Inventory Value" value={formatMoney(report.inventoryValue)} color="success" />
        <StatCard icon={TriangleAlert} label="Low Stock Drugs" value={report.lowStockCount} color="danger" />
        <StatCard icon={CheckCircle2} label="Prescriptions Dispensed" value={report.dispensedPrescriptions} color="secondary" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Low Stock Alerts</h2>
          {report.lowStock.length ? (
            <ul className="space-y-1 text-sm">
              {report.lowStock.map((d) => (
                <li key={d.id} className="flex justify-between border-b border-slate-100 dark:border-white/5 py-1">
                  <span>{d.drug_name}</span>
                  <span className="font-semibold text-danger">
                    {d.quantity_in_stock} / {d.reorder_level}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CheckCircle2} message="All drug stock levels are healthy." />
          )}
        </Card>

        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Most Dispensed Drugs</h2>
          {report.topDispensed.length ? (
            <ul className="space-y-1 text-sm">
              {report.topDispensed.map((d) => (
                <li key={d.drugName} className="flex justify-between border-b border-slate-100 dark:border-white/5 py-1">
                  <span>{d.drugName}</span>
                  <span className="font-semibold">{d.totalDispensed}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Pill} message="No dispensed prescriptions yet." />
          )}
        </Card>
      </div>
    </div>
  );
}

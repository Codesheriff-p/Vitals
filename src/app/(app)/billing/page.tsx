import Link from "next/link";
import { Plus, Eye, Receipt } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, Bill } from "@/models";
import type { IPatient, BillStatus } from "@/models";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import { btnPrimary, iconBtnOutline } from "@/components/ui/buttonStyles";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata = { title: "Billing - VITALS HMS" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole(["admin", "receptionist"]);
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";

  await connectDB();

  const bills = await Bill.find(status ? { status: status as BillStatus } : {})
    .populate<{ patientId: IPatient }>("patientId")
    .sort({ createdAt: -1 });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Billing" }]}
        title="Billing"
        action={
          <Link href="/billing/add" className={btnPrimary}>
            <Plus size={16} /> New Bill
          </Link>
        }
      />

      <FlashMessages searchParams={params} />

      <form action="/billing" method="GET" className="mb-4 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <div className="max-w-xs">
          <Select
            name="status"
            defaultValue={status}
            autoSubmit
            options={[
              { value: "", label: "All Statuses" },
              { value: "unpaid", label: "Unpaid" },
              { value: "partial", label: "Partial" },
              { value: "paid", label: "Paid" },
            ]}
          />
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        {bills.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Bill #</th>
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2.5 pr-3 font-semibold">{b.billNumber}</td>
                    <td className="py-2.5 pr-3">
                      {b.patientId?.firstName} {b.patientId?.lastName}{" "}
                      <span className="text-xs text-slate-400 dark:text-white">({b.patientId?.patientNumber})</span>
                    </td>
                    <td className="py-2.5 pr-3">{formatMoney(b.total)}</td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-2.5 pr-3">{formatDate(b.createdAt)}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex justify-end">
                        <Link href={`/billing/${b.id}`} title="View" className={iconBtnOutline}>
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Receipt} message="No bills found." />
        )}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { Printer, Receipt } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, Bill, Payment } from "@/models";
import type { IPatient, IUser } from "@/models";
import { recordPayment } from "@/actions/billing";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import { btnOutline, btnPrimary, inputClass, labelClass } from "@/components/ui/buttonStyles";

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "transfer", label: "Transfer" },
];
import { formatDate, formatMoney } from "@/lib/format";

export const metadata = { title: "Bill Details - VITALS HMS" };

export default async function BillDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole(["admin", "receptionist"]);
  const { id } = await params;
  const sp = await searchParams;

  await connectDB();

  const bill = await Bill.findById(id).populate<{ patientId: IPatient }>("patientId");
  if (!bill || !bill.patientId) notFound();

  const payments = await Payment.find({ billId: bill.id })
    .populate<{ receivedBy: IUser | null }>("receivedBy")
    .sort({ paymentDate: -1 });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = bill.total - totalPaid;
  const recordPaymentAction = recordPayment.bind(null, bill.id);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Billing", href: "/billing" }, { label: bill.billNumber }]}
        title={bill.billNumber}
        action={
          <Link href={`/invoices/${bill.id}`} target="_blank" className={btnOutline}>
            <Printer size={16} /> Print Invoice
          </Link>
        }
      />

      <FlashMessages searchParams={sp} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Bill Info</h2>
            <dl className="space-y-2 text-sm">
              <Row
                label="Patient"
                value={
                  <Link href={`/patients/${bill.patientId.id}`} className="text-trace-deep dark:text-trace hover:underline">
                    {bill.patientId.firstName} {bill.patientId.lastName}
                  </Link>
                }
              />
              <Row label="Status" value={<StatusBadge status={bill.status} />} />
              <Row label="Date" value={formatDate(bill.createdAt)} />
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Billable Items</h2>
            {bill.items.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                      <th className="py-2 pr-3">Description</th>
                      <th className="py-2 pr-3">Category</th>
                      <th className="py-2 pr-3">Qty</th>
                      <th className="py-2 pr-3">Unit Price</th>
                      <th className="py-2 pr-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((i) => (
                      <tr key={i.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                        <td className="py-2 pr-3">{i.description}</td>
                        <td className="py-2 pr-3 capitalize">{i.category}</td>
                        <td className="py-2 pr-3">{i.quantity}</td>
                        <td className="py-2 pr-3">{formatMoney(i.unitPrice)}</td>
                        <td className="py-2 pr-3">{formatMoney(i.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="py-2 pr-3 text-right text-slate-500 dark:text-white">
                        Subtotal
                      </td>
                      <td className="py-2 pr-3 font-semibold">{formatMoney(bill.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-2 pr-3 text-right text-slate-500 dark:text-white">
                        Discount
                      </td>
                      <td className="py-2 pr-3 font-semibold">- {formatMoney(bill.discount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-2 pr-3 text-right font-semibold text-slate-700 dark:text-white">
                        Total
                      </td>
                      <td className="py-2 pr-3 font-bold">{formatMoney(bill.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <EmptyState icon={Receipt} message="No items on this bill." />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Payment History</h2>
            {payments.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                      <th className="py-2 pr-3">Amount</th>
                      <th className="py-2 pr-3">Method</th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Received By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                        <td className="py-2 pr-3">{formatMoney(p.amount)}</td>
                        <td className="py-2 pr-3 capitalize">{p.paymentMethod}</td>
                        <td className="py-2 pr-3">{formatDate(p.paymentDate)}</td>
                        <td className="py-2 pr-3">{p.receivedBy?.name ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-white">No payments recorded yet.</p>
            )}
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Balance</h2>
            <div className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">{formatMoney(Math.max(balance, 0))}</div>

            {balance > 0 ? (
              <form action={recordPaymentAction} className="space-y-3">
                <div>
                  <label className={labelClass}>Amount (₦)</label>
                  <input type="number" step="0.01" min={0.01} max={balance} name="amount" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Payment Method</label>
                  <Select name="payment_method" defaultValue="cash" options={PAYMENT_METHOD_OPTIONS} />
                </div>
                <div>
                  <label className={labelClass}>Payment Date</label>
                  <DatePicker name="payment_date" defaultValue={new Date().toISOString().slice(0, 10)} />
                </div>
                <div>
                  <label className={labelClass}>Notes</label>
                  <input type="text" name="notes" className={inputClass} />
                </div>
                <button type="submit" className={`${btnPrimary} w-full justify-center`}>
                  Record Payment
                </button>
              </form>
            ) : (
              <p className="text-sm text-success">This bill is fully paid.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400 dark:text-white">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

import { notFound } from "next/navigation";
import { HeartPulse } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, Bill, Payment } from "@/models";
import type { IPatient } from "@/models";
import { formatDate, formatMoney } from "@/lib/format";
import PrintButton from "@/components/ui/PrintButton";

export const metadata = { title: "Invoice - VITALS HMS" };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "receptionist"]);
  const { id } = await params;

  await connectDB();

  const bill = await Bill.findById(id).populate<{ patientId: IPatient }>("patientId");
  if (!bill || !bill.patientId) notFound();

  const payments = await Payment.find({ billId: bill.id }).sort({ paymentDate: 1 });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(bill.total - totalPaid, 0);

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <div className="mb-6 flex items-center justify-between no-print">
        <span className="text-sm text-slate-500">Invoice preview — use the button to print or save as PDF.</span>
        <PrintButton />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm shadow-slate-900/[0.03] print:border-0 print:p-0 print:shadow-none">
        <div className="mb-8 flex items-start justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <HeartPulse size={24} />
            </div>
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-slate-900">VITALS HMS</div>
              <div className="text-xs text-slate-500">Hospital Management System</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-xl font-bold tracking-tight text-slate-900">INVOICE</div>
            <div className="font-mono text-sm text-slate-500">{bill.billNumber}</div>
            <div className="text-sm text-slate-500">{formatDate(bill.createdAt)}</div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase text-slate-400">Billed To</div>
            <div className="font-semibold text-slate-800">
              {bill.patientId.firstName} {bill.patientId.lastName}
            </div>
            <div className="text-sm text-slate-500">{bill.patientId.patientNumber}</div>
            <div className="text-sm text-slate-500">{bill.patientId.phone}</div>
          </div>
          <div className="text-right">
            <div className="mb-1 text-xs font-semibold uppercase text-slate-400">Status</div>
            <div className="font-semibold capitalize text-slate-800">{bill.status}</div>
          </div>
        </div>

        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-500">
              <th className="py-2">Description</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Unit Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((i) => (
              <tr key={i.id} className="border-b border-slate-100">
                <td className="py-2">{i.description}</td>
                <td className="py-2">{i.quantity}</td>
                <td className="py-2">{formatMoney(i.unitPrice)}</td>
                <td className="py-2 text-right">{formatMoney(i.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto w-full max-w-xs space-y-1 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span>{formatMoney(bill.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Discount</span>
            <span>- {formatMoney(bill.discount)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
            <span>Total</span>
            <span>{formatMoney(bill.total)}</span>
          </div>
          <div className="flex justify-between text-success">
            <span>Paid</span>
            <span>{formatMoney(totalPaid)}</span>
          </div>
          <div className="flex justify-between font-semibold text-danger">
            <span>Balance Due</span>
            <span>{formatMoney(balance)}</span>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">Thank you for choosing VITALS HMS.</p>
      </div>
    </div>
  );
}

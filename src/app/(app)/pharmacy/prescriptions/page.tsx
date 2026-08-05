import Link from "next/link";
import { Plus, Pill, Eye, FileText } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, Prescription } from "@/models";
import type { IPatient, IDoctor, IUser, PrescriptionStatus } from "@/models";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import { btnPrimary, btnOutline, iconBtnOutline } from "@/components/ui/buttonStyles";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Prescriptions - VITALS HMS" };

type DoctorWithUser = IDoctor & { userId: IUser };

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireRole(["admin", "pharmacist", "doctor"]);
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";

  await connectDB();

  const prescriptions = await Prescription.find(status ? { status: status as PrescriptionStatus } : {})
    .populate<{ patientId: IPatient }>("patientId")
    .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } })
    .sort({ createdAt: -1 });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Pharmacy", href: "/pharmacy" }, { label: "Prescriptions" }]}
        title="Prescriptions"
        action={
          <div className="flex gap-2">
            <Link href="/pharmacy" className={btnOutline}>
              <Pill size={16} /> Inventory
            </Link>
            {["admin", "doctor"].includes(user.role) && (
              <Link href="/pharmacy/prescriptions/add" className={btnPrimary}>
                <Plus size={16} /> New Prescription
              </Link>
            )}
          </div>
        }
      />

      <FlashMessages searchParams={params} />

      <form action="/pharmacy/prescriptions" method="GET" className="mb-4 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <div className="max-w-xs">
          <Select
            name="status"
            defaultValue={status}
            autoSubmit
            options={[
              { value: "", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "dispensed", label: "Dispensed" },
            ]}
          />
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        {prescriptions.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Doctor</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2.5 pr-3">#{p.id.slice(-6)}</td>
                    <td className="py-2.5 pr-3">
                      {p.patientId?.firstName} {p.patientId?.lastName}{" "}
                      <span className="text-xs text-slate-400 dark:text-white">({p.patientId?.patientNumber})</span>
                    </td>
                    <td className="py-2.5 pr-3">{p.doctorId?.userId?.name}</td>
                    <td className="py-2.5 pr-3">
                      <Badge tone={p.status === "dispensed" ? "success" : "warning"}>{p.status}</Badge>
                    </td>
                    <td className="py-2.5 pr-3">{formatDate(p.createdAt)}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex justify-end">
                        <Link href={`/pharmacy/prescriptions/${p.id}`} title="View" className={iconBtnOutline}>
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
          <EmptyState icon={FileText} message="No prescriptions found." />
        )}
      </div>
    </div>
  );
}

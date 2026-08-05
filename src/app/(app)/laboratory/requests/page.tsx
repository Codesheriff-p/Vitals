import Link from "next/link";
import { Plus, FlaskConical, Eye } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, LabRequest } from "@/models";
import type { IPatient, IDoctor, IUser, LabRequestStatus } from "@/models";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import { btnPrimary, btnOutline, iconBtnOutline } from "@/components/ui/buttonStyles";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Lab Requests - VITALS HMS" };

type DoctorWithUser = IDoctor & { userId: IUser };

export default async function LabRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireRole(["admin", "lab_technician", "doctor"]);
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";

  await connectDB();

  const requests = await LabRequest.find(status ? { status: status as LabRequestStatus } : {})
    .populate<{ patientId: IPatient }>("patientId")
    .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } })
    .sort({ createdAt: -1 });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Laboratory", href: "/laboratory" }, { label: "Requests" }]}
        title="Lab Requests"
        action={
          <div className="flex gap-2">
            <Link href="/laboratory" className={btnOutline}>
              <FlaskConical size={16} /> Test Catalog
            </Link>
            {["admin", "doctor"].includes(user.role) && (
              <Link href="/laboratory/requests/add" className={btnPrimary}>
                <Plus size={16} /> New Request
              </Link>
            )}
          </div>
        }
      />

      <FlashMessages searchParams={params} />

      <form action="/laboratory/requests" method="GET" className="mb-4 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <div className="max-w-xs">
          <Select
            name="status"
            defaultValue={status}
            autoSubmit
            options={[
              { value: "", label: "All Statuses" },
              { value: "requested", label: "Requested" },
              { value: "processing", label: "Processing" },
              { value: "completed", label: "Completed" },
            ]}
          />
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        {requests.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Request #</th>
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Doctor</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2.5 pr-3 font-semibold">{r.requestNumber}</td>
                    <td className="py-2.5 pr-3">
                      {r.patientId?.firstName} {r.patientId?.lastName}{" "}
                      <span className="text-xs text-slate-400 dark:text-white">({r.patientId?.patientNumber})</span>
                    </td>
                    <td className="py-2.5 pr-3">{r.doctorId?.userId?.name}</td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-2.5 pr-3">{formatDate(r.createdAt)}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex justify-end">
                        <Link href={`/laboratory/requests/${r.id}`} title="View" className={iconBtnOutline}>
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
          <EmptyState icon={FlaskConical} message="No lab requests found." />
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Types } from "mongoose";
import { Plus, Eye, Pencil, Trash2, CalendarX2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, Appointment, Doctor } from "@/models";
import type { IPatient, IDoctor, IUser, IDepartment } from "@/models";
import { deleteAppointment } from "@/actions/appointments";
import { APPOINTMENT_STATUSES } from "@/lib/appointmentTypes";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import { StatusBadge } from "@/components/ui/Badge";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import { btnPrimary, iconBtnOutline, iconBtnOutlineDanger } from "@/components/ui/buttonStyles";
import { formatDate } from "@/lib/format";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  ...APPOINTMENT_STATUSES.map((s) => ({ value: s, label: s })),
];

export const metadata = { title: "Appointments - VITALS HMS" };

type DoctorWithUser = IDoctor & { userId: IUser };

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireRole(["admin", "doctor", "nurse", "receptionist"]);
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const date = typeof params.date === "string" ? params.date : "";

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (date) filter.appointmentDate = new Date(date);

  if (user.role === "doctor") {
    const doctor = await Doctor.findOne({ userId: user.id });
    filter.doctorId = doctor?.id ?? new Types.ObjectId();
  }

  const appointments = await Appointment.find(filter)
    .populate<{ patientId: IPatient }>("patientId")
    .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } })
    .populate<{ departmentId: IDepartment | null }>("departmentId")
    .sort({ appointmentDate: -1, appointmentTime: -1 });

  const canManage = ["admin", "nurse", "receptionist"].includes(user.role);
  const canDelete = ["admin", "receptionist"].includes(user.role);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Appointments" }]}
        title="Appointments"
        action={
          canManage && (
            <Link href="/appointments/add" className={btnPrimary}>
              <Plus size={16} /> New Appointment
            </Link>
          )
        }
      />

      <FlashMessages searchParams={params} />

      <form action="/appointments" method="GET" className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <div className="w-full max-w-xs">
          <Select name="status" defaultValue={status} options={STATUS_OPTIONS} />
        </div>
        <div className="w-full max-w-xs">
          <DatePicker name="date" defaultValue={date} placeholder="Filter by date..." />
        </div>
        <button type="submit" className="rounded-lg border border-slate-300 dark:border-white/15 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5">
          Filter
        </button>
        {(status || date) && (
          <Link href="/appointments" className="flex items-center text-sm text-slate-500 dark:text-white hover:text-trace-deep dark:hover:text-trace">
            Clear
          </Link>
        )}
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        {appointments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Appt #</th>
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Doctor</th>
                  <th className="py-2 pr-3">Department</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2.5 pr-3 font-semibold">{a.appointmentNumber}</td>
                    <td className="py-2.5 pr-3">
                      {a.patientId?.firstName} {a.patientId?.lastName}
                      <br />
                      <span className="text-xs text-slate-400 dark:text-white">{a.patientId?.patientNumber}</span>
                    </td>
                    <td className="py-2.5 pr-3">{a.doctorId?.userId?.name}</td>
                    <td className="py-2.5 pr-3">{a.departmentId?.name || "—"}</td>
                    <td className="py-2.5 pr-3">{formatDate(a.appointmentDate)}</td>
                    <td className="py-2.5 pr-3">{a.appointmentTime}</td>
                    <td className="py-2.5 pr-3">{a.type}</td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/appointments/${a.id}`} title="View" className={iconBtnOutline}>
                          <Eye size={14} />
                        </Link>
                        <Link href={`/appointments/${a.id}/edit`} title="Edit" className={iconBtnOutline}>
                          <Pencil size={14} />
                        </Link>
                        {canDelete && (
                          <form action={deleteAppointment.bind(null, a.id)}>
                            <ConfirmSubmitButton
                              confirmMessage={`Delete appointment ${a.appointmentNumber}?`}
                              className={iconBtnOutlineDanger}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </ConfirmSubmitButton>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={CalendarX2} message="No appointments found." />
        )}
      </div>
    </div>
  );
}

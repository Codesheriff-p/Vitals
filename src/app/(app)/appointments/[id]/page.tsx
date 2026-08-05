import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Pill, FlaskConical, Receipt, FilePlus2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, Appointment } from "@/models";
import type { IPatient, IDoctor, IUser, IDepartment } from "@/models";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import { StatusBadge } from "@/components/ui/Badge";
import { btnOutline } from "@/components/ui/buttonStyles";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Appointment Details - VITALS HMS" };

type DoctorWithUser = IDoctor & { userId: IUser };

export default async function AppointmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireRole(["admin", "doctor", "nurse", "receptionist"]);
  const { id } = await params;
  const sp = await searchParams;

  await connectDB();

  const appointment = await Appointment.findById(id)
    .populate<{ patientId: IPatient }>("patientId")
    .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } })
    .populate<{ departmentId: IDepartment | null }>("departmentId");
  if (!appointment || !appointment.patientId || !appointment.doctorId?.userId) notFound();

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Appointments", href: "/appointments" },
          { label: appointment.appointmentNumber },
        ]}
        title={appointment.appointmentNumber}
        action={
          <Link href={`/appointments/${appointment.id}/edit`} className={btnOutline}>
            <Pencil size={16} /> Edit
          </Link>
        }
      />

      <FlashMessages searchParams={sp} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Appointment Details</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Status" value={<StatusBadge status={appointment.status} />} />
            <Row label="Date" value={formatDate(appointment.appointmentDate)} />
            <Row label="Time" value={appointment.appointmentTime} />
            <Row label="Type" value={appointment.type ?? "—"} />
            <Row label="Department" value={appointment.departmentId?.name ?? "—"} />
            <Row label="Notes" value={appointment.notes ?? "—"} />
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Patient &amp; Doctor</h2>
          <dl className="mb-4 space-y-2 text-sm">
            <Row
              label="Patient"
              value={
                <Link href={`/patients/${appointment.patientId.id}`} className="text-trace-deep dark:text-trace hover:underline">
                  {appointment.patientId.firstName} {appointment.patientId.lastName}
                </Link>
              }
            />
            <Row label="Patient #" value={appointment.patientId.patientNumber} />
            <Row label="Phone" value={appointment.patientId.phone ?? "—"} />
            <Row
              label="Doctor"
              value={
                <Link href={`/doctors/${appointment.doctorId.id}`} className="text-trace-deep dark:text-trace hover:underline">
                  {appointment.doctorId.userId.name}
                </Link>
              }
            />
          </dl>

          <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-white">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            {(user.role === "admin" || user.role === "doctor") && (
              <Link
                href={`/medical-records/add?appointment_id=${appointment.id}&patient_id=${appointment.patientId.id}&doctor_id=${appointment.doctorId.id}`}
                className={btnOutline}
              >
                <FilePlus2 size={16} /> Add Medical Record
              </Link>
            )}
            <Link
              href={`/pharmacy/prescriptions/add?appointment_id=${appointment.id}&patient_id=${appointment.patientId.id}`}
              className={btnOutline}
            >
              <Pill size={16} /> Prescribe
            </Link>
            <Link
              href={`/laboratory/requests/add?appointment_id=${appointment.id}&patient_id=${appointment.patientId.id}`}
              className={btnOutline}
            >
              <FlaskConical size={16} /> Request Lab Test
            </Link>
            <Link href={`/billing/add?appointment_id=${appointment.id}&patient_id=${appointment.patientId.id}`} className={btnOutline}>
              <Receipt size={16} /> Generate Bill
            </Link>
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

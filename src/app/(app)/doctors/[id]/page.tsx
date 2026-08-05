import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, CalendarX2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { connectDB, Doctor, Appointment } from "@/models";
import type { IUser, IDepartment, IPatient } from "@/models";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { btnOutline } from "@/components/ui/buttonStyles";
import { formatDate } from "@/lib/format";
import { toPhotoDataUrl } from "@/lib/image";

export const metadata = { title: "Doctor Details - VITALS HMS" };

export default async function DoctorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;

  await connectDB();

  const doctor = await Doctor.findById(id)
    .select("+photo +photoContentType")
    .populate<{ userId: IUser }>("userId")
    .populate<{ departmentId: IDepartment | null }>("departmentId");
  if (!doctor || !doctor.userId) notFound();

  const appointments = await Appointment.find({ doctorId: doctor.id })
    .populate<{ patientId: IPatient }>("patientId")
    .sort({ appointmentDate: -1, appointmentTime: -1 })
    .limit(20);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Doctors", href: "/doctors" }, { label: doctor.userId.name }]}
        title={doctor.userId.name}
        action={
          user.role === "admin" && (
            <Link href={`/doctors/${doctor.id}/edit`} className={btnOutline}>
              <Pencil size={16} /> Edit
            </Link>
          )
        }
      />

      <FlashMessages searchParams={sp} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <div className="mb-4 flex items-center gap-3">
              <Avatar src={toPhotoDataUrl(doctor.photo, doctor.photoContentType)} name={doctor.userId.name} size="lg" />
              <p className="font-semibold text-slate-800 dark:text-white">Dr. {doctor.userId.name}</p>
            </div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Doctor Information</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Specialization" value={doctor.specialization ?? "—"} strong />
              <Row label="Department" value={doctor.departmentId?.name ?? "—"} />
              <Row label="Qualification" value={doctor.qualification ?? "—"} />
              <Row label="Phone" value={doctor.phone ?? "—"} />
              <Row label="Email" value={doctor.userId.email} />
              <Row label="Status" value={doctor.status} capitalize />
            </dl>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Recent Appointments</h2>
            {appointments.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                      <th className="py-2 pr-3">Appt #</th>
                      <th className="py-2 pr-3">Patient</th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Time</th>
                      <th className="py-2 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                        <td className="py-2 pr-3">{a.appointmentNumber}</td>
                        <td className="py-2 pr-3">
                          {a.patientId?.firstName} {a.patientId?.lastName}
                        </td>
                        <td className="py-2 pr-3">{formatDate(a.appointmentDate)}</td>
                        <td className="py-2 pr-3">{a.appointmentTime}</td>
                        <td className="py-2 pr-3">
                          <StatusBadge status={a.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={CalendarX2} message="No appointments on record." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong, capitalize }: { label: string; value: string; strong?: boolean; capitalize?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400 dark:text-white">{label}</dt>
      <dd className={`text-right ${strong ? "font-semibold" : ""} ${capitalize ? "capitalize" : ""}`}>{value}</dd>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, FilePlus2, Pencil, Printer, CalendarX2, FileHeart, Receipt, Stethoscope } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { connectDB, Patient, Appointment, MedicalRecord, Bill } from "@/models";
import type { IDoctor, IUser } from "@/models";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import DoctorCard from "@/components/ui/DoctorCard";
import { btnPrimary, btnOutline, cardClass } from "@/components/ui/buttonStyles";
import { formatDate, formatMoney, calcAge } from "@/lib/format";
import { toPhotoDataUrl } from "@/lib/image";

export const metadata = { title: "Patient Details - VITALS HMS" };

type DoctorWithUser = IDoctor & { userId: IUser };

export default async function PatientDetailPage({
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
  const patient = await Patient.findById(id)
    .select("+photo +photoContentType")
    .populate<{ assignedDoctorId: DoctorWithUser | null }>({
      path: "assignedDoctorId",
      populate: { path: "userId" },
      options: { select: "+photo +photoContentType" },
    });
  if (!patient) notFound();

  const [appointments, medicalRecords, bills] = await Promise.all([
    Appointment.find({ patientId: patient.id })
      .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } })
      .sort({ appointmentDate: -1, appointmentTime: -1 }),
    MedicalRecord.find({ patientId: patient.id })
      .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } })
      .sort({ createdAt: -1 }),
    Bill.find({ patientId: patient.id }).sort({ createdAt: -1 }),
  ]);

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Patients", href: "/patients" },
          { label: patient.patientNumber },
        ]}
        title={`${patient.firstName} ${patient.lastName}`}
        action={
          <div className="flex gap-2">
            <Link href={`/patients/${patient.id}/print`} target="_blank" className={btnOutline}>
              <Printer size={16} /> Print
            </Link>
            <Link href={`/patients/${patient.id}/edit`} className={btnOutline}>
              <Pencil size={16} /> Edit
            </Link>
            {(user.role === "admin" || user.role === "doctor") && (
              <Link href={`/medical-records/add?patient_id=${patient.id}`} className={btnOutline}>
                <FilePlus2 size={16} /> New Medical Record
              </Link>
            )}
            <Link href={`/appointments/add?patient_id=${patient.id}`} className={btnPrimary}>
              <CalendarPlus size={16} /> New Appointment
            </Link>
          </div>
        }
      />

      <FlashMessages searchParams={sp} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <div className="mb-4 flex items-center gap-3">
              <Avatar
                src={toPhotoDataUrl(patient.photo, patient.photoContentType)}
                name={`${patient.firstName} ${patient.lastName}`}
                size="lg"
              />
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-xs font-medium text-trace-deep dark:text-trace">{patient.patientNumber}</p>
              </div>
            </div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Patient Information</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Patient #" value={patient.patientNumber} strong />
              <Row label="Gender" value={patient.gender ?? "—"} capitalize />
              <Row
                label="Date of Birth"
                value={patient.dob ? `${formatDate(patient.dob)} (${calcAge(patient.dob)} yrs)` : "—"}
              />
              <Row label="Blood Group" value={patient.bloodGroup ?? "—"} />
              <Row label="Phone" value={patient.phone} />
              <Row label="Email" value={patient.email ?? "—"} />
              <Row label="Address" value={patient.address ?? "—"} />
              <Row label="Next of Kin" value={patient.nextOfKin ?? "—"} />
              <Row label="NOK Phone" value={patient.nextOfKinPhone ?? "—"} />
              <Row label="Registered" value={formatDate(patient.createdAt)} />
            </dl>
          </div>

          <div className={cardClass}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Attending Doctor</h2>
            {patient.assignedDoctorId ? (
              <DoctorCard
                doctor={{
                  id: patient.assignedDoctorId.id,
                  name: patient.assignedDoctorId.userId.name,
                  specialization: patient.assignedDoctorId.specialization,
                  qualification: patient.assignedDoctorId.qualification,
                  phone: patient.assignedDoctorId.phone,
                  email: patient.assignedDoctorId.userId.email,
                  department: null,
                  status: patient.assignedDoctorId.status,
                  photoUrl: toPhotoDataUrl(patient.assignedDoctorId.photo, patient.assignedDoctorId.photoContentType),
                }}
              />
            ) : (
              <EmptyState icon={Stethoscope} message="No attending doctor assigned yet." />
            )}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Appointment History</h2>
            {appointments.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                      <th className="py-2 pr-3">Appt #</th>
                      <th className="py-2 pr-3">Doctor</th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Time</th>
                      <th className="py-2 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                        <td className="py-2 pr-3">{a.appointmentNumber}</td>
                        <td className="py-2 pr-3">{a.doctorId?.userId?.name}</td>
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

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Medical Records</h2>
            {medicalRecords.length ? (
              <div className="space-y-3">
                {medicalRecords.map((mr) => (
                  <div key={mr.id} className="border-b border-slate-100 dark:border-white/5 pb-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{mr.diagnosis}</span>
                      <span className="text-xs text-slate-400 dark:text-white">{formatDate(mr.createdAt)}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-white">
                      {mr.doctorId?.userId?.name} — {mr.treatment || "No treatment notes"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={FileHeart} message="No medical records on file." />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Billing History</h2>
            {bills.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                      <th className="py-2 pr-3">Bill #</th>
                      <th className="py-2 pr-3">Total</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((b) => (
                      <tr key={b.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                        <td className="py-2 pr-3">{b.billNumber}</td>
                        <td className="py-2 pr-3">{formatMoney(b.total)}</td>
                        <td className="py-2 pr-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="py-2 pr-3">{formatDate(b.createdAt)}</td>
                        <td className="py-2 pr-3 text-right">
                          <Link href={`/billing/${b.id}`} className="text-sm text-trace-deep dark:text-trace hover:underline">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={Receipt} message="No bills on record." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong, capitalize }: { label: string; value: React.ReactNode; strong?: boolean; capitalize?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400 dark:text-white">{label}</dt>
      <dd className={`text-right ${strong ? "font-semibold" : ""} ${capitalize ? "capitalize" : ""}`}>{value}</dd>
    </div>
  );
}

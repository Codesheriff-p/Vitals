import { notFound } from "next/navigation";
import { HeartPulse } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { connectDB, Patient, Appointment, MedicalRecord } from "@/models";
import type { IDoctor, IUser } from "@/models";
import PrintButton from "@/components/ui/PrintButton";
import Avatar from "@/components/ui/Avatar";
import { formatDate, calcAge } from "@/lib/format";
import { toPhotoDataUrl } from "@/lib/image";

export const metadata = { title: "Patient Summary - VITALS HMS" };

type DoctorWithUser = IDoctor & { userId: IUser };

export default async function PatientPrintPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  await connectDB();
  const patient = await Patient.findById(id)
    .select("+photo +photoContentType")
    .populate<{ assignedDoctorId: DoctorWithUser | null }>({
      path: "assignedDoctorId",
      populate: { path: "userId" },
    });
  if (!patient) notFound();

  const [appointments, medicalRecords] = await Promise.all([
    Appointment.find({ patientId: patient.id })
      .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(15),
    MedicalRecord.find({ patientId: patient.id })
      .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } })
      .sort({ createdAt: -1 })
      .limit(15),
  ]);

  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <div className="mb-6 flex items-center justify-between no-print">
        <span className="text-sm text-slate-500">Patient summary — use the button to print or save as PDF.</span>
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
            <div className="font-display text-xl font-bold tracking-tight text-slate-900">PATIENT SUMMARY</div>
            <div className="font-mono text-sm text-slate-500">{patient.patientNumber}</div>
            <div className="text-sm text-slate-500">Printed {formatDate(new Date())}</div>
          </div>
        </div>

        <div className="mb-8 flex items-start gap-4">
          <Avatar
            src={toPhotoDataUrl(patient.photo, patient.photoContentType)}
            name={`${patient.firstName} ${patient.lastName}`}
            size="xl"
          />
          <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="col-span-2">
              <div className="text-lg font-semibold text-slate-900">
                {patient.firstName} {patient.lastName}
              </div>
              <div className="text-slate-500">{patient.patientNumber}</div>
            </div>
            <Field label="Gender" value={patient.gender ?? "—"} capitalize />
            <Field label="Date of Birth" value={patient.dob ? `${formatDate(patient.dob)} (${calcAge(patient.dob)} yrs)` : "—"} />
            <Field label="Blood Group" value={patient.bloodGroup ?? "—"} />
            <Field label="Phone" value={patient.phone} />
            <Field label="Email" value={patient.email ?? "—"} />
            <Field label="Registered" value={formatDate(patient.createdAt)} />
            <Field label="Address" value={patient.address ?? "—"} span />
            <Field label="Next of Kin" value={patient.nextOfKin ?? "—"} />
            <Field label="NOK Phone" value={patient.nextOfKinPhone ?? "—"} />
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase text-slate-400">Attending Doctor</div>
          {patient.assignedDoctorId ? (
            <div className="rounded-lg border border-slate-200 p-3 text-sm">
              <div className="font-semibold text-slate-800">Dr. {patient.assignedDoctorId.userId.name}</div>
              <div className="text-slate-500">
                {patient.assignedDoctorId.specialization ?? "General Practice"}
                {patient.assignedDoctorId.qualification ? ` — ${patient.assignedDoctorId.qualification}` : ""}
              </div>
              <div className="text-slate-500">
                {patient.assignedDoctorId.phone ?? "—"} · {patient.assignedDoctorId.userId.email}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No attending doctor assigned.</p>
          )}
        </div>

        <div className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase text-slate-400">Appointment History</div>
          {appointments.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="py-2">Appt #</th>
                  <th className="py-2">Doctor</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Time</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="py-2">{a.appointmentNumber}</td>
                    <td className="py-2">{a.doctorId?.userId?.name ? `Dr. ${a.doctorId.userId.name}` : "—"}</td>
                    <td className="py-2">{formatDate(a.appointmentDate)}</td>
                    <td className="py-2">{a.appointmentTime}</td>
                    <td className="py-2 capitalize">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-slate-400">No appointments on record.</p>
          )}
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase text-slate-400">Medical Records</div>
          {medicalRecords.length ? (
            <div className="space-y-2">
              {medicalRecords.map((mr) => (
                <div key={mr.id} className="border-b border-slate-100 pb-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800">{mr.diagnosis}</span>
                    <span className="text-xs text-slate-400">{formatDate(mr.createdAt)}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {mr.doctorId?.userId?.name ? `Dr. ${mr.doctorId.userId.name}` : "—"} — {mr.treatment || "No treatment notes"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No medical records on file.</p>
          )}
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">VITALS HMS — confidential patient record.</p>
      </div>
    </div>
  );
}

function Field({ label, value, capitalize, span }: { label: string; value: string; capitalize?: boolean; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : undefined}>
      <div className="text-xs font-semibold uppercase text-slate-400">{label}</div>
      <div className={`text-slate-700 ${capitalize ? "capitalize" : ""}`}>{value}</div>
    </div>
  );
}

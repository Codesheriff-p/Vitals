import { requireRole } from "@/lib/auth";
import { connectDB, Patient, Doctor } from "@/models";
import type { IUser } from "@/models";
import { createMedicalRecord } from "@/actions/medicalRecords";
import PageHeader from "@/components/ui/PageHeader";
import MedicalRecordForm from "../MedicalRecordForm";

export const metadata = { title: "New Medical Record - VITALS HMS" };

export default async function AddMedicalRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireRole(["admin", "doctor"]);
  const params = await searchParams;

  await connectDB();

  const [patients, doctors] = await Promise.all([
    Patient.find().sort({ firstName: 1 }),
    Doctor.find().populate<{ userId: IUser }>("userId"),
  ]);
  doctors.sort((a, b) => a.userId.name.localeCompare(b.userId.name));

  let defaultDoctorId: string | undefined;
  if (user.role === "doctor") {
    const doctor = doctors.find((d) => d.userId.id === user.id);
    defaultDoctorId = doctor ? doctor.id : undefined;
  }

  const defaultPatientId = typeof params.patient_id === "string" ? params.patient_id : undefined;
  const doctorIdParam = typeof params.doctor_id === "string" ? params.doctor_id : undefined;

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Patients", href: "/patients" },
          { label: "New Medical Record" },
        ]}
        title="New Medical Record"
      />
      <MedicalRecordForm
        action={createMedicalRecord}
        patients={patients.map((p) => ({ id: p.id, patientNumber: p.patientNumber, firstName: p.firstName, lastName: p.lastName }))}
        doctors={doctors.map((d) => ({ id: d.id, name: d.userId.name }))}
        defaultPatientId={defaultPatientId}
        defaultDoctorId={doctorIdParam ?? defaultDoctorId}
        appointmentId={typeof params.appointment_id === "string" ? params.appointment_id : undefined}
        cancelHref={defaultPatientId ? `/patients/${defaultPatientId}` : "/patients"}
      />
    </div>
  );
}

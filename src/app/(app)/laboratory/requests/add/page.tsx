import { requireRole } from "@/lib/auth";
import { connectDB, Patient, Doctor, LabTest } from "@/models";
import type { IUser } from "@/models";
import { createLabRequest } from "@/actions/laboratory";
import PageHeader from "@/components/ui/PageHeader";
import LabRequestForm from "../LabRequestForm";

export const metadata = { title: "New Lab Request - VITALS HMS" };

export default async function AddLabRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireRole(["admin", "doctor"]);
  const params = await searchParams;

  await connectDB();

  const [patients, doctors, tests] = await Promise.all([
    Patient.find().sort({ firstName: 1 }),
    Doctor.find().populate<{ userId: IUser }>("userId"),
    LabTest.find().sort({ testName: 1 }),
  ]);
  doctors.sort((a, b) => a.userId.name.localeCompare(b.userId.name));

  let defaultDoctorId: string | undefined;
  if (user.role === "doctor") {
    const doctor = doctors.find((d) => d.userId.id === user.id);
    defaultDoctorId = doctor ? doctor.id : undefined;
  }

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Laboratory", href: "/laboratory" },
          { label: "Requests", href: "/laboratory/requests" },
          { label: "New" },
        ]}
        title="New Lab Request"
      />
      <LabRequestForm
        action={createLabRequest}
        patients={patients.map((p) => ({ id: p.id, patientNumber: p.patientNumber, firstName: p.firstName, lastName: p.lastName }))}
        doctors={doctors.map((d) => ({ id: d.id, name: d.userId.name }))}
        tests={tests.map((t) => ({ id: t.id, testName: t.testName, price: Number(t.price) }))}
        defaultPatientId={typeof params.patient_id === "string" ? params.patient_id : undefined}
        defaultDoctorId={defaultDoctorId}
        appointmentId={typeof params.appointment_id === "string" ? params.appointment_id : undefined}
      />
    </div>
  );
}

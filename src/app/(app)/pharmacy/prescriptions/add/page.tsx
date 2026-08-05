import { requireRole } from "@/lib/auth";
import { connectDB, Patient, Doctor, PharmacyDrug } from "@/models";
import type { IUser } from "@/models";
import { createPrescription } from "@/actions/pharmacy";
import PageHeader from "@/components/ui/PageHeader";
import PrescriptionForm from "../PrescriptionForm";

export const metadata = { title: "New Prescription - VITALS HMS" };

export default async function AddPrescriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireRole(["admin", "doctor"]);
  const params = await searchParams;

  await connectDB();

  const [patients, doctors, drugs] = await Promise.all([
    Patient.find().sort({ firstName: 1 }),
    Doctor.find().populate<{ userId: IUser }>("userId"),
    PharmacyDrug.find().sort({ drugName: 1 }),
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
          { label: "Pharmacy", href: "/pharmacy" },
          { label: "Prescriptions", href: "/pharmacy/prescriptions" },
          { label: "New" },
        ]}
        title="New Prescription"
      />
      <PrescriptionForm
        action={createPrescription}
        patients={patients.map((p) => ({ id: p.id, patientNumber: p.patientNumber, firstName: p.firstName, lastName: p.lastName }))}
        doctors={doctors.map((d) => ({ id: d.id, name: d.userId.name }))}
        drugs={drugs.map((d) => ({ id: d.id, drugName: d.drugName, unit: d.unit, quantityInStock: d.quantityInStock }))}
        defaultPatientId={typeof params.patient_id === "string" ? params.patient_id : undefined}
        defaultDoctorId={defaultDoctorId}
        appointmentId={typeof params.appointment_id === "string" ? params.appointment_id : undefined}
      />
    </div>
  );
}

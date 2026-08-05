import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { connectDB, Patient, Doctor } from "@/models";
import type { IUser } from "@/models";
import { updatePatient } from "@/actions/patients";
import PageHeader from "@/components/ui/PageHeader";
import { toPhotoDataUrl } from "@/lib/image";
import PatientForm from "../../PatientForm";

export const metadata = { title: "Edit Patient - VITALS HMS" };

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  await connectDB();
  const [patient, doctors] = await Promise.all([
    Patient.findById(id).select("+photo +photoContentType"),
    Doctor.find({ status: "active" }).populate<{ userId: IUser }>("userId"),
  ]);
  if (!patient) notFound();

  doctors.sort((a, b) => a.userId.name.localeCompare(b.userId.name));

  const action = updatePatient.bind(null, patient.id);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Patients", href: "/patients" }, { label: "Edit" }]}
        title={`Edit Patient — ${patient.firstName} ${patient.lastName}`}
      />
      <PatientForm
        action={action}
        doctors={doctors.map((d) => ({ id: d.id, name: d.userId.name }))}
        submitLabel="Save Changes"
        cancelHref={`/patients/${patient.id}`}
        defaults={{
          first_name: patient.firstName,
          last_name: patient.lastName,
          dob: patient.dob ? patient.dob.toISOString().slice(0, 10) : undefined,
          gender: patient.gender ?? undefined,
          blood_group: patient.bloodGroup ?? undefined,
          phone: patient.phone,
          email: patient.email ?? undefined,
          address: patient.address ?? undefined,
          next_of_kin: patient.nextOfKin ?? undefined,
          next_of_kin_phone: patient.nextOfKinPhone ?? undefined,
          assigned_doctor_id: patient.assignedDoctorId ? String(patient.assignedDoctorId) : undefined,
          photo: toPhotoDataUrl(patient.photo, patient.photoContentType),
        }}
      />
    </div>
  );
}

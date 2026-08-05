import { requireUser } from "@/lib/auth";
import { connectDB, Doctor } from "@/models";
import type { IUser } from "@/models";
import { createPatient } from "@/actions/patients";
import PageHeader from "@/components/ui/PageHeader";
import PatientForm from "../PatientForm";

export const metadata = { title: "Add Patient - VITALS HMS" };

export default async function AddPatientPage() {
  await requireUser();

  await connectDB();
  const doctors = await Doctor.find({ status: "active" }).populate<{ userId: IUser }>("userId");
  doctors.sort((a, b) => a.userId.name.localeCompare(b.userId.name));

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Patients", href: "/patients" }, { label: "Add" }]}
        title="Add Patient"
      />
      <PatientForm
        action={createPatient}
        doctors={doctors.map((d) => ({ id: d.id, name: d.userId.name }))}
        submitLabel="Save Patient"
        cancelHref="/patients"
      />
    </div>
  );
}

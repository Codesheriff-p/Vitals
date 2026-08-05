import { requireRole } from "@/lib/auth";
import { connectDB, Patient, Doctor } from "@/models";
import type { IUser, IDepartment } from "@/models";
import { createAppointment } from "@/actions/appointments";
import PageHeader from "@/components/ui/PageHeader";
import AppointmentForm from "../AppointmentForm";

export const metadata = { title: "New Appointment - VITALS HMS" };

export default async function AddAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole(["admin", "nurse", "receptionist"]);
  const params = await searchParams;
  const patientId = typeof params.patient_id === "string" ? params.patient_id : "";

  await connectDB();

  const [patients, doctors] = await Promise.all([
    Patient.find().sort({ firstName: 1 }),
    Doctor.find({ status: "active" })
      .populate<{ userId: IUser }>("userId")
      .populate<{ departmentId: IDepartment | null }>("departmentId"),
  ]);
  doctors.sort((a, b) => a.userId.name.localeCompare(b.userId.name));

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Appointments", href: "/appointments" }, { label: "New" }]}
        title="New Appointment"
      />
      <AppointmentForm
        action={createAppointment}
        patients={patients.map((p) => ({ id: p.id, patientNumber: p.patientNumber, firstName: p.firstName, lastName: p.lastName }))}
        doctors={doctors.map((d) => ({ id: d.id, name: d.userId.name, departmentName: d.departmentId?.name }))}
        defaults={{ patient_id: patientId }}
        submitLabel="Schedule Appointment"
        cancelHref="/appointments"
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, Appointment, Patient, Doctor } from "@/models";
import type { IUser } from "@/models";
import { updateAppointment } from "@/actions/appointments";
import PageHeader from "@/components/ui/PageHeader";
import AppointmentForm from "../../AppointmentForm";

export const metadata = { title: "Edit Appointment - VITALS HMS" };

export default async function EditAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "doctor", "nurse", "receptionist"]);
  const { id } = await params;

  await connectDB();

  const [appointment, patients, doctors] = await Promise.all([
    Appointment.findById(id),
    Patient.find().sort({ firstName: 1 }),
    Doctor.find().populate<{ userId: IUser }>("userId"),
  ]);
  doctors.sort((a, b) => a.userId.name.localeCompare(b.userId.name));

  if (!appointment) notFound();

  const action = updateAppointment.bind(null, appointment.id);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Appointments", href: "/appointments" }, { label: "Edit" }]}
        title="Edit Appointment"
      />
      <AppointmentForm
        action={action}
        patients={patients.map((p) => ({ id: p.id, patientNumber: p.patientNumber, firstName: p.firstName, lastName: p.lastName }))}
        doctors={doctors.map((d) => ({ id: d.id, name: d.userId.name }))}
        submitLabel="Save Changes"
        cancelHref={`/appointments/${appointment.id}`}
        showStatus
        defaults={{
          patient_id: String(appointment.patientId),
          doctor_id: String(appointment.doctorId),
          appointment_date: appointment.appointmentDate.toISOString().slice(0, 10),
          appointment_time: appointment.appointmentTime.slice(0, 5),
          type: appointment.type ?? undefined,
          status: appointment.status,
          notes: appointment.notes ?? undefined,
        }}
      />
    </div>
  );
}

"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, Appointment, Doctor } from "@/models";
import type { AppointmentStatus } from "@/models";

export interface FormState {
  error?: string;
}

async function generateAppointmentNumber(): Promise<string> {
  const count = await Appointment.countDocuments();
  return "APT-" + String(count + 1).padStart(4, "0");
}

function validate(formData: FormData): string | undefined {
  if (!formData.get("patient_id")) return "Please select a patient.";
  if (!formData.get("doctor_id")) return "Please select a doctor.";
  if (!formData.get("appointment_date")) return "Appointment date is required.";
  if (!formData.get("appointment_time")) return "Appointment time is required.";
  return undefined;
}

export async function createAppointment(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireRole(["admin", "nurse", "receptionist"]);

  const error = validate(formData);
  if (error) return { error };

  await connectDB();

  const patientId = String(formData.get("patient_id"));
  const doctorId = String(formData.get("doctor_id"));
  const appointmentDate = String(formData.get("appointment_date"));
  const appointmentTime = String(formData.get("appointment_time"));

  const conflict = await Appointment.findOne({
    doctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: "scheduled",
  });
  if (conflict) return { error: "This doctor already has a scheduled appointment at that date and time." };

  const doctor = await Doctor.findById(doctorId);
  const appointmentNumber = await generateAppointmentNumber();

  await Appointment.create({
    appointmentNumber,
    patientId,
    doctorId,
    departmentId: doctor?.departmentId ?? null,
    appointmentDate,
    appointmentTime,
    type: (formData.get("type") as string) || "Consultation",
    status: "scheduled",
    notes: (formData.get("notes") as string) || null,
    createdBy: user.id,
  });

  redirect(`/appointments?success=${encodeURIComponent(`Appointment ${appointmentNumber} scheduled successfully.`)}`);
}

export async function updateAppointment(id: string, _prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin", "doctor", "nurse", "receptionist"]);

  const error = validate(formData);
  if (error) return { error };

  await connectDB();

  const appointment = await Appointment.findById(id);
  if (!appointment) return { error: "Appointment not found." };

  const doctorId = String(formData.get("doctor_id"));
  const doctor = await Doctor.findById(doctorId);

  Object.assign(appointment, {
    patientId: String(formData.get("patient_id")),
    doctorId,
    departmentId: doctor?.departmentId ?? null,
    appointmentDate: String(formData.get("appointment_date")),
    appointmentTime: String(formData.get("appointment_time")),
    type: (formData.get("type") as string) || "Consultation",
    status: (formData.get("status") as AppointmentStatus) || "scheduled",
    notes: (formData.get("notes") as string) || null,
  });
  await appointment.save();

  redirect(`/appointments/${id}?success=${encodeURIComponent("Appointment updated successfully.")}`);
}

export async function deleteAppointment(id: string) {
  await requireRole(["admin", "receptionist"]);
  await connectDB();

  let failed = false;
  try {
    await Appointment.deleteOne({ _id: id });
  } catch {
    failed = true;
  }

  if (failed) {
    redirect(`/appointments?error=${encodeURIComponent("Unable to delete appointment.")}`);
  }
  redirect(`/appointments?success=${encodeURIComponent("Appointment deleted.")}`);
}

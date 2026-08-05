"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, MedicalRecord } from "@/models";

export interface FormState {
  error?: string;
}

export async function createMedicalRecord(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin", "doctor"]);

  const patientId = String(formData.get("patient_id") || "");
  const doctorId = String(formData.get("doctor_id") || "");
  const appointmentId = (formData.get("appointment_id") as string) || "";
  const diagnosis = String(formData.get("diagnosis") || "").trim();

  if (!patientId) return { error: "Please select a patient." };
  if (!doctorId) return { error: "Please select a doctor." };
  if (!diagnosis) return { error: "Diagnosis is required." };

  await connectDB();

  try {
    await MedicalRecord.create({
      patientId,
      doctorId,
      appointmentId: appointmentId || null,
      diagnosis,
      symptoms: (formData.get("symptoms") as string) || null,
      treatment: (formData.get("treatment") as string) || null,
      prescriptionNotes: (formData.get("prescription_notes") as string) || null,
      followUpDate: (formData.get("follow_up_date") as string) || null,
    });
  } catch (err) {
    console.error("Medical record create error:", err);
    return { error: "Something went wrong while saving the medical record." };
  }

  redirect(`/patients/${patientId}?success=${encodeURIComponent("Medical record added successfully.")}`);
}

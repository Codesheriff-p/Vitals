"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { connectDB, Patient, Appointment, MedicalRecord, Prescription, LabRequest, Bill } from "@/models";
import { readPhotoField } from "@/lib/image";

export interface FormState {
  error?: string;
}

async function generatePatientNumber(): Promise<string> {
  const count = await Patient.countDocuments();
  return "PAT-" + String(count + 1).padStart(4, "0");
}

function validate(formData: FormData): { error?: string } {
  const firstName = String(formData.get("first_name") || "").trim();
  const lastName = String(formData.get("last_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const gender = String(formData.get("gender") || "");

  if (!firstName) return { error: "First name is required." };
  if (!lastName) return { error: "Last name is required." };
  if (!phone) return { error: "Phone number is required." };
  if (!["male", "female", "other"].includes(gender)) return { error: "Gender is required." };
  return {};
}

export async function createPatient(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const { error } = validate(formData);
  if (error) return { error };

  const photo = await readPhotoField(formData, "photo");
  if (photo && "error" in photo) return { error: photo.error };

  await connectDB();

  const patientNumber = await generatePatientNumber();

  await Patient.create({
    patientNumber,
    firstName: String(formData.get("first_name")).trim(),
    lastName: String(formData.get("last_name")).trim(),
    dob: (formData.get("dob") as string) || null,
    gender: formData.get("gender") as "male" | "female" | "other",
    bloodGroup: (formData.get("blood_group") as string) || null,
    phone: String(formData.get("phone")).trim(),
    email: (formData.get("email") as string) || null,
    address: (formData.get("address") as string) || null,
    nextOfKin: (formData.get("next_of_kin") as string) || null,
    nextOfKinPhone: (formData.get("next_of_kin_phone") as string) || null,
    assignedDoctorId: (formData.get("assigned_doctor_id") as string) || null,
    ...(photo ? { photo: photo.photo, photoContentType: photo.photoContentType } : {}),
    registeredBy: user.id,
  });

  redirect(`/patients?success=${encodeURIComponent(`Patient ${patientNumber} registered successfully.`)}`);
}

export async function updatePatient(id: string, _prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireUser();

  const { error } = validate(formData);
  if (error) return { error };

  const photo = await readPhotoField(formData, "photo");
  if (photo && "error" in photo) return { error: photo.error };

  await connectDB();

  const patient = await Patient.findById(id);
  if (!patient) return { error: "Patient not found." };

  Object.assign(patient, {
    firstName: String(formData.get("first_name")).trim(),
    lastName: String(formData.get("last_name")).trim(),
    dob: (formData.get("dob") as string) || null,
    gender: formData.get("gender") as "male" | "female" | "other",
    bloodGroup: (formData.get("blood_group") as string) || null,
    phone: String(formData.get("phone")).trim(),
    email: (formData.get("email") as string) || null,
    address: (formData.get("address") as string) || null,
    nextOfKin: (formData.get("next_of_kin") as string) || null,
    nextOfKinPhone: (formData.get("next_of_kin_phone") as string) || null,
    assignedDoctorId: (formData.get("assigned_doctor_id") as string) || null,
    ...(photo ? { photo: photo.photo, photoContentType: photo.photoContentType } : {}),
  });
  await patient.save();

  redirect(`/patients/${id}?success=${encodeURIComponent("Patient details updated successfully.")}`);
}

export async function deletePatient(id: string) {
  await requireUser();
  await connectDB();

  const patient = await Patient.findById(id);
  if (!patient) {
    redirect(`/patients?error=${encodeURIComponent("Patient not found.")}`);
  }

  // MongoDB has no foreign-key RESTRICT — check for dependent records ourselves
  // before deleting, so patient history can't be silently orphaned.
  const [hasAppointments, hasMedicalRecords, hasPrescriptions, hasLabRequests, hasBills] = await Promise.all([
    Appointment.exists({ patientId: id }),
    MedicalRecord.exists({ patientId: id }),
    Prescription.exists({ patientId: id }),
    LabRequest.exists({ patientId: id }),
    Bill.exists({ patientId: id }),
  ]);

  if (hasAppointments || hasMedicalRecords || hasPrescriptions || hasLabRequests || hasBills) {
    redirect(
      `/patients?error=${encodeURIComponent("Unable to delete patient. They may have linked records (appointments, bills, etc).")}`
    );
  }

  await patient.deleteOne();

  redirect(`/patients?success=${encodeURIComponent("Patient record deleted.")}`);
}

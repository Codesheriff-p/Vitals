"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, User, Doctor, Appointment, MedicalRecord, Prescription, LabRequest } from "@/models";
import { readPhotoField } from "@/lib/image";

export interface FormState {
  error?: string;
}

function validateCommon(formData: FormData): string | undefined {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const specialization = String(formData.get("specialization") || "").trim();

  if (!name) return "Full name is required.";
  if (!email) return "Email is required.";
  if (!specialization) return "Specialization is required.";
  return undefined;
}

export async function createDoctor(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin"]);

  const commonError = validateCommon(formData);
  const password = String(formData.get("password") || "");
  if (commonError) return { error: commonError };
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters." };

  const photo = await readPhotoField(formData, "photo");
  if (photo && "error" in photo) return { error: photo.error };

  const mongoose = await connectDB();

  const email = String(formData.get("email")).trim();
  const existing = await User.findOne({ email });
  if (existing) return { error: "A user with this email already exists." };

  const departmentId = (formData.get("department_id") as string) || null;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const hashed = await bcrypt.hash(password, 10);
      const [user] = await User.create(
        [{ name: String(formData.get("name")).trim(), email, password: hashed, role: "doctor", status: "active" }],
        { session }
      );
      await Doctor.create(
        [
          {
            userId: user._id,
            specialization: String(formData.get("specialization")).trim(),
            departmentId,
            qualification: (formData.get("qualification") as string) || null,
            phone: (formData.get("phone") as string) || null,
            status: "active",
            ...(photo ? { photo: photo.photo, photoContentType: photo.photoContentType } : {}),
          },
        ],
        { session }
      );
    });
  } catch (err) {
    console.error("Doctor create error:", err);
    return { error: "Something went wrong while saving the doctor. Please try again." };
  } finally {
    await session.endSession();
  }

  redirect(`/doctors?success=${encodeURIComponent("Doctor added successfully.")}`);
}

export async function updateDoctor(id: string, _prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin"]);

  const commonError = validateCommon(formData);
  if (commonError) return { error: commonError };

  const photo = await readPhotoField(formData, "photo");
  if (photo && "error" in photo) return { error: photo.error };

  const mongoose = await connectDB();

  const doctor = await Doctor.findById(id);
  if (!doctor) return { error: "Doctor not found." };

  const departmentId = (formData.get("department_id") as string) || null;
  const status = (formData.get("status") as "active" | "inactive") || "active";

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await User.updateOne(
        { _id: doctor.userId },
        { name: String(formData.get("name")).trim(), email: String(formData.get("email")).trim(), status },
        { session }
      );
      Object.assign(doctor, {
        specialization: String(formData.get("specialization")).trim(),
        departmentId,
        qualification: (formData.get("qualification") as string) || null,
        phone: (formData.get("phone") as string) || null,
        status,
        ...(photo ? { photo: photo.photo, photoContentType: photo.photoContentType } : {}),
      });
      await doctor.save({ session });
    });
  } catch (err) {
    console.error("Doctor update error:", err);
    return { error: "Unable to update doctor." };
  } finally {
    await session.endSession();
  }

  redirect(`/doctors/${id}?success=${encodeURIComponent("Doctor details updated successfully.")}`);
}

export async function deleteDoctor(id: string) {
  await requireRole(["admin"]);
  const mongoose = await connectDB();

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    redirect(`/doctors?error=${encodeURIComponent("Doctor not found.")}`);
  }

  const [hasAppointments, hasMedicalRecords, hasPrescriptions, hasLabRequests] = await Promise.all([
    Appointment.exists({ doctorId: id }),
    MedicalRecord.exists({ doctorId: id }),
    Prescription.exists({ doctorId: id }),
    LabRequest.exists({ doctorId: id }),
  ]);

  if (hasAppointments || hasMedicalRecords || hasPrescriptions || hasLabRequests) {
    redirect(`/doctors?error=${encodeURIComponent("Unable to delete doctor. They may have linked appointments or records.")}`);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Doctor.deleteOne({ _id: id }, { session });
      await User.deleteOne({ _id: doctor.userId }, { session });
    });
  } catch (err) {
    console.error("Doctor delete error:", err);
    redirect(`/doctors?error=${encodeURIComponent("Unable to delete doctor.")}`);
  } finally {
    await session.endSession();
  }

  redirect(`/doctors?success=${encodeURIComponent("Doctor removed successfully.")}`);
}

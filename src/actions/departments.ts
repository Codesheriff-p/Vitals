"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, Department } from "@/models";

export interface FormState {
  error?: string;
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === 11000;
}

export async function createDepartment(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin"]);
  await connectDB();

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Department name is required." };

  const headDoctorId = (formData.get("head_doctor_id") as string) || null;

  try {
    await Department.create({ name, description: (formData.get("description") as string) || null, headDoctorId });
  } catch (err: unknown) {
    console.error("Department create error:", err);
    const isDup = isDuplicateKeyError(err);
    return { error: isDup ? "A department with this name already exists." : "Something went wrong while saving the department." };
  }

  redirect(`/departments?success=${encodeURIComponent(`Department "${name}" created successfully.`)}`);
}

export async function updateDepartment(id: string, _prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin"]);
  await connectDB();

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Department name is required." };

  const department = await Department.findById(id);
  if (!department) return { error: "Department not found." };

  const headDoctorId = (formData.get("head_doctor_id") as string) || null;

  try {
    Object.assign(department, { name, description: (formData.get("description") as string) || null, headDoctorId });
    await department.save();
  } catch (err) {
    console.error("Department update error:", err);
    return { error: "Unable to update department." };
  }

  redirect(`/departments?success=${encodeURIComponent("Department updated successfully.")}`);
}

export async function deleteDepartment(id: string) {
  await requireRole(["admin"]);
  await connectDB();

  const department = await Department.findById(id);
  if (!department) {
    redirect(`/departments?error=${encodeURIComponent("Department not found.")}`);
  }

  try {
    await department.deleteOne();
  } catch {
    redirect(`/departments?error=${encodeURIComponent("Unable to delete department.")}`);
  }

  redirect(`/departments?success=${encodeURIComponent("Department deleted.")}`);
}

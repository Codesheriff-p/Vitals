"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, User, Staff } from "@/models";
import { isStaffRole } from "@/lib/staffRoles";
import { readPhotoField } from "@/lib/image";

export interface FormState {
  error?: string;
}

export async function createStaff(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin"]);

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "");

  if (!name) return { error: "Full name is required." };
  if (!email) return { error: "Email is required." };
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters." };
  if (!isStaffRole(role)) return { error: "Please select a valid staff role." };

  const photo = await readPhotoField(formData, "photo");
  if (photo && "error" in photo) return { error: photo.error };

  const mongoose = await connectDB();

  const existing = await User.findOne({ email });
  if (existing) return { error: "A user with this email already exists." };

  const departmentId = (formData.get("department_id") as string) || null;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const hashed = await bcrypt.hash(password, 10);
      const [user] = await User.create([{ name, email, password: hashed, role, status: "active" }], { session });
      await Staff.create(
        [
          {
            userId: user._id,
            departmentId,
            roleTitle: (formData.get("role_title") as string) || null,
            phone: (formData.get("phone") as string) || null,
            status: "active",
            ...(photo ? { photo: photo.photo, photoContentType: photo.photoContentType } : {}),
          },
        ],
        { session }
      );
    });
  } catch (err) {
    console.error("Staff create error:", err);
    return { error: "Something went wrong while saving the staff member." };
  } finally {
    await session.endSession();
  }

  redirect(`/staff?success=${encodeURIComponent(`${name} added to staff successfully.`)}`);
}

export async function updateStaff(id: string, _prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin"]);

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "");

  if (!name) return { error: "Full name is required." };
  if (!email) return { error: "Email is required." };
  if (!isStaffRole(role)) return { error: "Please select a valid staff role." };

  const photo = await readPhotoField(formData, "photo");
  if (photo && "error" in photo) return { error: photo.error };

  const mongoose = await connectDB();

  const member = await Staff.findById(id);
  if (!member) return { error: "Staff member not found." };

  const departmentId = (formData.get("department_id") as string) || null;
  const status = (formData.get("status") as "active" | "inactive") || "active";

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await User.updateOne({ _id: member.userId }, { name, email, role, status }, { session });
      Object.assign(member, {
        departmentId,
        roleTitle: (formData.get("role_title") as string) || null,
        phone: (formData.get("phone") as string) || null,
        status,
        ...(photo ? { photo: photo.photo, photoContentType: photo.photoContentType } : {}),
      });
      await member.save({ session });
    });
  } catch (err) {
    console.error("Staff update error:", err);
    return { error: "Unable to update staff member." };
  } finally {
    await session.endSession();
  }

  redirect(`/staff?success=${encodeURIComponent("Staff details updated successfully.")}`);
}

export async function deleteStaff(id: string) {
  await requireRole(["admin"]);
  const mongoose = await connectDB();

  const member = await Staff.findById(id);
  if (!member) {
    redirect(`/staff?error=${encodeURIComponent("Staff member not found.")}`);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Staff.deleteOne({ _id: id }, { session });
      await User.deleteOne({ _id: member.userId }, { session });
    });
  } catch (err) {
    console.error("Staff delete error:", err);
    redirect(`/staff?error=${encodeURIComponent("Unable to delete staff member. They may have linked records.")}`);
  } finally {
    await session.endSession();
  }

  redirect(`/staff?success=${encodeURIComponent("Staff member removed successfully.")}`);
}

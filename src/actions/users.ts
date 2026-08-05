"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, User } from "@/models";
import { isValidRole } from "@/lib/userRoles";
import type { UserRole } from "@/types/auth";
import { readPhotoField } from "@/lib/image";

export interface FormState {
  error?: string;
}

export async function createUser(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin"]);

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "");

  if (!name) return { error: "Full name is required." };
  if (!email) return { error: "Email is required." };
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters." };
  if (!isValidRole(role)) return { error: "Please select a valid role." };

  const photo = await readPhotoField(formData, "photo");
  if (photo && "error" in photo) return { error: photo.error };

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) return { error: "A user with this email already exists." };

  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hashed,
    role,
    status: "active",
    ...(photo ? { photo: photo.photo, photoContentType: photo.photoContentType } : {}),
  });

  redirect(`/users?success=${encodeURIComponent(`${name} added successfully.`)}`);
}

export async function updateUser(id: string, _prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  await requireRole(["admin"]);

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "");
  const status = (formData.get("status") as "active" | "inactive") || "active";
  const password = String(formData.get("password") || "");

  if (!name) return { error: "Full name is required." };
  if (!email) return { error: "Email is required." };
  if (!isValidRole(role)) return { error: "Please select a valid role." };
  if (password && password.length < 6) return { error: "Password must be at least 6 characters." };

  const photo = await readPhotoField(formData, "photo");
  if (photo && "error" in photo) return { error: photo.error };

  await connectDB();

  const user = await User.findById(id);
  if (!user) return { error: "User not found." };

  const updates: Partial<{
    name: string;
    email: string;
    role: UserRole;
    status: "active" | "inactive";
    password: string;
    photo: string;
    photoContentType: string;
  }> = {
    name,
    email,
    role,
    status,
  };
  if (password) updates.password = await bcrypt.hash(password, 10);
  if (photo) {
    updates.photo = photo.photo;
    updates.photoContentType = photo.photoContentType;
  }

  Object.assign(user, updates);
  await user.save();

  redirect(`/users?success=${encodeURIComponent("User updated successfully.")}`);
}

export async function deleteUser(id: string) {
  const currentUser = await requireRole(["admin"]);
  await connectDB();

  if (currentUser.id === id) {
    redirect(`/users?error=${encodeURIComponent("You cannot delete your own account.")}`);
  }

  let failed = false;
  try {
    await User.deleteOne({ _id: id });
  } catch {
    failed = true;
  }

  if (failed) {
    redirect(`/users?error=${encodeURIComponent("Unable to delete user. They may have linked records.")}`);
  }
  redirect(`/users?success=${encodeURIComponent("User deleted successfully.")}`);
}

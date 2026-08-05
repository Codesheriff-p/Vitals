"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, setSessionCookie } from "@/lib/auth";
import { connectDB, User } from "@/models";
import { readPhotoField } from "@/lib/image";

export interface FormState {
  error?: string;
}

export async function updateOwnProfile(_prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const currentUser = await requireUser();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const dob = (formData.get("dob") as string) || null;
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmNewPassword = String(formData.get("confirmNewPassword") || "");

  if (!name) return { error: "Full name is required." };
  if (!email) return { error: "Email is required." };

  const photo = await readPhotoField(formData, "photo");
  if (photo && "error" in photo) return { error: photo.error };

  await connectDB();

  const user = await User.findById(currentUser.id).select("+password");
  if (!user) return { error: "User not found." };

  if (email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user.id } });
    if (existing) return { error: "A user with this email already exists." };
  }

  if (newPassword) {
    if (!currentPassword) return { error: "Enter your current password to set a new one." };
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return { error: "Current password is incorrect." };
    if (newPassword.length < 6) return { error: "New password must be at least 6 characters." };
    if (newPassword !== confirmNewPassword) return { error: "New password and confirmation do not match." };
  }

  Object.assign(user, {
    name,
    email,
    phone: phone || null,
    dob,
    ...(newPassword ? { password: await bcrypt.hash(newPassword, 10) } : {}),
    ...(photo ? { photo: photo.photo, photoContentType: photo.photoContentType } : {}),
  });
  await user.save();

  if (name !== currentUser.name || email !== currentUser.email) {
    await setSessionCookie({ id: currentUser.id, name, email, role: currentUser.role });
  }

  // The navbar avatar lives in the shared layout, which won't otherwise
  // refetch since this redirect targets the same route it was rendered from.
  revalidatePath("/", "layout");

  redirect(`/profile?success=${encodeURIComponent("Profile updated successfully.")}`);
}

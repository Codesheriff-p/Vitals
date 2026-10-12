"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { connectDB, User, AuditLog } from "@/models";
import {
  setSessionCookie,
  clearSessionCookie,
  getCurrentUser,
} from "@/lib/auth";
import { isSelfServiceRole } from "@/lib/userRoles";

export interface LoginState {
  error?: string;
}

export interface SignupState {
  error?: string;
}

export async function signup(_prevState: SignupState | undefined, formData: FormData): Promise<SignupState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");
  const role = String(formData.get("role") || "");

  if (!name) return { error: "Full name is required." };
  if (!email) return { error: "Email is required." };
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  if (!isSelfServiceRole(role)) return { error: "Please select a valid role." };

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) return { error: "An account with this email already exists." };

  const account = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
    status: "active",
  });

  await setSessionCookie({
    id: account._id.toString(),
    name: account.name,
    email: account.email,
    role: account.role,
  });

  redirect("/dashboard");
}

/** Only same-origin paths are accepted, so a crafted `?next=` can't bounce a
    freshly signed-in user off to another site. */
function safeNext(value: string): string | null {
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export async function login(_prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = safeNext(String(formData.get("next") || ""));

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  await connectDB();

  const account = await User.findOne({ email });
  if (!account) {
    return { error: "Invalid email or password." };
  }

  if (account.status !== "active") {
    return { error: "This account has been deactivated. Contact an administrator." };
  }

  const match = await bcrypt.compare(password, account.password);
  if (!match) {
    return { error: "Invalid email or password." };
  }

  const sessionUser = {
    id: account._id.toString(),
    name: account.name,
    email: account.email,
    role: account.role,
  };

  await setSessionCookie(sessionUser);

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  await AuditLog.create({ userId: sessionUser.id, action: "LOGIN", module: "auth", recordId: null, ipAddress: ip });

  redirect(next ?? "/dashboard");
}

export async function logout() {
  const user = await getCurrentUser();
  if (user) {
    await connectDB();
    await AuditLog.create({ userId: user.id, action: "LOGOUT", module: "auth", recordId: null, ipAddress: null });
  }
  await clearSessionCookie();
  redirect("/login");
}

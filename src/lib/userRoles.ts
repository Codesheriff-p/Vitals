import type { UserRole } from "@/types/auth";

export const ALL_ROLES: UserRole[] = ["admin", "doctor", "nurse", "pharmacist", "lab_technician", "receptionist"];

// Roles an account can request through public signup. Admin accounts are
// always created directly by an existing admin via /users, never self-served.
export const SELF_SERVICE_ROLES: UserRole[] = ALL_ROLES.filter((r) => r !== "admin");

export function roleLabel(r: string): string {
  return r.replace("_", " ");
}

export function isValidRole(role: string): role is UserRole {
  return (ALL_ROLES as string[]).includes(role);
}

export function isSelfServiceRole(role: string): role is UserRole {
  return (SELF_SERVICE_ROLES as string[]).includes(role);
}

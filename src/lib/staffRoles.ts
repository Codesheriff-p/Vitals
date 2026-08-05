import type { UserRole } from "@/types/auth";

export const STAFF_ROLES: UserRole[] = ["nurse", "pharmacist", "lab_technician", "receptionist"];

export function isStaffRole(role: string): role is UserRole {
  return (STAFF_ROLES as string[]).includes(role);
}

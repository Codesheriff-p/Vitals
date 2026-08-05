export type UserRole = "admin" | "doctor" | "nurse" | "pharmacist" | "lab_technician" | "receptionist";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

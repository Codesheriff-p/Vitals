import type { LucideIcon } from "lucide-react";
import {
  Gauge,
  Users,
  CalendarCheck,
  BadgeCheck,
  Pill,
  FlaskConical,
  Receipt,
  UserCog,
  Network,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import type { UserRole } from "@/types/auth";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export interface NavSection {
  heading: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Gauge, roles: ["admin", "doctor", "nurse", "pharmacist", "lab_technician", "receptionist"] },
    ],
  },
  {
    heading: "Clinical",
    items: [
      { href: "/patients", label: "Patients", icon: Users, roles: ["admin", "doctor", "nurse", "receptionist"] },
      { href: "/appointments", label: "Appointments", icon: CalendarCheck, roles: ["admin", "doctor", "nurse", "receptionist"] },
      { href: "/doctors", label: "Doctors", icon: BadgeCheck, roles: ["admin", "receptionist"] },
    ],
  },
  {
    heading: "Pharmacy",
    items: [{ href: "/pharmacy", label: "Pharmacy", icon: Pill, roles: ["admin", "pharmacist", "doctor"] }],
  },
  {
    heading: "Laboratory",
    items: [{ href: "/laboratory", label: "Laboratory", icon: FlaskConical, roles: ["admin", "lab_technician", "doctor"] }],
  },
  {
    heading: "Finance",
    items: [{ href: "/billing", label: "Billing", icon: Receipt, roles: ["admin", "receptionist"] }],
  },
  {
    heading: "Administration",
    items: [
      { href: "/staff", label: "Staff", icon: UserCog, roles: ["admin"] },
      { href: "/departments", label: "Departments", icon: Network, roles: ["admin"] },
      { href: "/reports", label: "Reports", icon: BarChart3, roles: ["admin"] },
      { href: "/users", label: "Users", icon: ShieldCheck, roles: ["admin"] },
    ],
  },
];

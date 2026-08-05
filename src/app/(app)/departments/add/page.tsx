import { requireRole } from "@/lib/auth";
import { connectDB, Doctor } from "@/models";
import type { IUser } from "@/models";
import { createDepartment } from "@/actions/departments";
import PageHeader from "@/components/ui/PageHeader";
import DepartmentForm from "../DepartmentForm";

export const metadata = { title: "Add Department - VITALS HMS" };

export default async function AddDepartmentPage() {
  await requireRole(["admin"]);
  await connectDB();

  const doctors = await Doctor.find().populate<{ userId: IUser }>("userId");
  doctors.sort((a, b) => a.userId.name.localeCompare(b.userId.name));

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Departments", href: "/departments" }, { label: "Add" }]}
        title="Add Department"
      />
      <DepartmentForm
        action={createDepartment}
        doctors={doctors.map((d) => ({ id: d.id, name: d.userId.name }))}
        submitLabel="Save Department"
      />
    </div>
  );
}

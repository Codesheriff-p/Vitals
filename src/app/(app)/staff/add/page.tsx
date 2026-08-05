import { requireRole } from "@/lib/auth";
import { connectDB, Department } from "@/models";
import { createStaff } from "@/actions/staff";
import PageHeader from "@/components/ui/PageHeader";
import StaffForm from "../StaffForm";

export const metadata = { title: "Add Staff - VITALS HMS" };

export default async function AddStaffPage() {
  await requireRole(["admin"]);
  await connectDB();
  const departments = await Department.find().sort({ name: 1 });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Staff", href: "/staff" }, { label: "Add" }]}
        title="Add Staff"
      />
      <StaffForm
        action={createStaff}
        departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        submitLabel="Save Staff"
        showPassword
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, Department, Doctor } from "@/models";
import type { IUser } from "@/models";
import { updateDepartment } from "@/actions/departments";
import PageHeader from "@/components/ui/PageHeader";
import DepartmentForm from "../../DepartmentForm";

export const metadata = { title: "Edit Department - VITALS HMS" };

export default async function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin"]);
  const { id } = await params;

  await connectDB();

  const [department, doctors] = await Promise.all([Department.findById(id), Doctor.find().populate<{ userId: IUser }>("userId")]);
  doctors.sort((a, b) => a.userId.name.localeCompare(b.userId.name));

  if (!department) notFound();

  const action = updateDepartment.bind(null, department.id);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Departments", href: "/departments" }, { label: "Edit" }]}
        title="Edit Department"
      />
      <DepartmentForm
        action={action}
        doctors={doctors.map((d) => ({ id: d.id, name: d.userId.name }))}
        submitLabel="Save Changes"
        defaults={{
          name: department.name,
          description: department.description ?? undefined,
          head_doctor_id: department.headDoctorId ? String(department.headDoctorId) : undefined,
        }}
      />
    </div>
  );
}

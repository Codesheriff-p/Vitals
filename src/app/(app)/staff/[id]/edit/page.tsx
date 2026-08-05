import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, Staff, Department } from "@/models";
import type { IUser } from "@/models";
import { updateStaff } from "@/actions/staff";
import PageHeader from "@/components/ui/PageHeader";
import { toPhotoDataUrl } from "@/lib/image";
import StaffForm from "../../StaffForm";

export const metadata = { title: "Edit Staff - VITALS HMS" };

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin"]);
  const { id } = await params;

  await connectDB();

  const [member, departments] = await Promise.all([
    Staff.findById(id).select("+photo +photoContentType").populate<{ userId: IUser }>("userId"),
    Department.find().sort({ name: 1 }),
  ]);

  if (!member || !member.userId) notFound();

  const action = updateStaff.bind(null, member.id);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Staff", href: "/staff" }, { label: "Edit" }]}
        title={`Edit Staff — ${member.userId.name}`}
      />
      <StaffForm
        action={action}
        departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        submitLabel="Save Changes"
        showStatus
        defaults={{
          name: member.userId.name,
          email: member.userId.email,
          role: member.userId.role,
          department_id: member.departmentId ? String(member.departmentId) : undefined,
          role_title: member.roleTitle ?? undefined,
          phone: member.phone ?? undefined,
          status: member.userId.status,
          photo: toPhotoDataUrl(member.photo, member.photoContentType),
        }}
      />
    </div>
  );
}

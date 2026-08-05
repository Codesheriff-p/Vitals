import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, Doctor, Department } from "@/models";
import type { IUser } from "@/models";
import { updateDoctor } from "@/actions/doctors";
import PageHeader from "@/components/ui/PageHeader";
import { toPhotoDataUrl } from "@/lib/image";
import DoctorForm from "../../DoctorForm";

export const metadata = { title: "Edit Doctor - VITALS HMS" };

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin"]);
  const { id } = await params;

  await connectDB();

  const [doctor, departments] = await Promise.all([
    Doctor.findById(id).select("+photo +photoContentType").populate<{ userId: IUser }>("userId"),
    Department.find().sort({ name: 1 }),
  ]);

  if (!doctor || !doctor.userId) notFound();

  const action = updateDoctor.bind(null, doctor.id);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Doctors", href: "/doctors" }, { label: "Edit" }]}
        title={`Edit Doctor — ${doctor.userId.name}`}
      />
      <DoctorForm
        action={action}
        departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        submitLabel="Save Changes"
        cancelHref={`/doctors/${doctor.id}`}
        showStatus
        defaults={{
          name: doctor.userId.name,
          email: doctor.userId.email,
          specialization: doctor.specialization ?? undefined,
          department_id: doctor.departmentId ? String(doctor.departmentId) : undefined,
          qualification: doctor.qualification ?? undefined,
          phone: doctor.phone ?? undefined,
          status: doctor.userId.status,
          photo: toPhotoDataUrl(doctor.photo, doctor.photoContentType),
        }}
      />
    </div>
  );
}

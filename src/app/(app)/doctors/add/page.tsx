import { requireRole } from "@/lib/auth";
import { connectDB, Department } from "@/models";
import { createDoctor } from "@/actions/doctors";
import PageHeader from "@/components/ui/PageHeader";
import DoctorForm from "../DoctorForm";

export const metadata = { title: "Add Doctor - VITALS HMS" };

export default async function AddDoctorPage() {
  await requireRole(["admin"]);
  await connectDB();
  const departments = await Department.find().sort({ name: 1 });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Doctors", href: "/doctors" }, { label: "Add" }]}
        title="Add Doctor"
      />
      <DoctorForm
        action={createDoctor}
        departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        submitLabel="Save Doctor"
        cancelHref="/doctors"
        showPassword
      />
    </div>
  );
}

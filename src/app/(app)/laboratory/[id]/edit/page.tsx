import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, LabTest } from "@/models";
import { updateLabTest } from "@/actions/laboratory";
import PageHeader from "@/components/ui/PageHeader";
import LabTestForm from "../../LabTestForm";

export const metadata = { title: "Edit Lab Test - VITALS HMS" };

export default async function EditLabTestPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "lab_technician"]);
  const { id } = await params;

  await connectDB();
  const test = await LabTest.findById(id);
  if (!test) notFound();

  const action = updateLabTest.bind(null, test.id);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Laboratory", href: "/laboratory" }, { label: "Edit" }]}
        title={`Edit Lab Test — ${test.testName}`}
      />
      <LabTestForm
        action={action}
        submitLabel="Save Changes"
        defaults={{
          test_name: test.testName,
          description: test.description ?? undefined,
          normal_range: test.normalRange ?? undefined,
          unit: test.unit ?? undefined,
          price: String(test.price),
        }}
      />
    </div>
  );
}

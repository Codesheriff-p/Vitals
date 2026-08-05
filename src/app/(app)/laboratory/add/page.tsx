import { requireRole } from "@/lib/auth";
import { createLabTest } from "@/actions/laboratory";
import PageHeader from "@/components/ui/PageHeader";
import LabTestForm from "../LabTestForm";

export const metadata = { title: "Add Lab Test - VITALS HMS" };

export default async function AddLabTestPage() {
  await requireRole(["admin", "lab_technician"]);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Laboratory", href: "/laboratory" }, { label: "Add" }]}
        title="Add Lab Test"
      />
      <LabTestForm action={createLabTest} submitLabel="Save Test" />
    </div>
  );
}

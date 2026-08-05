import { requireRole } from "@/lib/auth";
import { createDrug } from "@/actions/pharmacy";
import PageHeader from "@/components/ui/PageHeader";
import DrugForm from "../DrugForm";

export const metadata = { title: "Add Drug - VITALS HMS" };

export default async function AddDrugPage() {
  await requireRole(["admin", "pharmacist"]);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Pharmacy", href: "/pharmacy" }, { label: "Add" }]}
        title="Add Drug"
      />
      <DrugForm action={createDrug} submitLabel="Save Drug" />
    </div>
  );
}

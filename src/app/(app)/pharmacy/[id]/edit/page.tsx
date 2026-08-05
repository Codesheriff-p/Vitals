import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, PharmacyDrug } from "@/models";
import { updateDrug } from "@/actions/pharmacy";
import PageHeader from "@/components/ui/PageHeader";
import DrugForm from "../../DrugForm";

export const metadata = { title: "Edit Drug - VITALS HMS" };

export default async function EditDrugPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "pharmacist"]);
  const { id } = await params;

  await connectDB();
  const drug = await PharmacyDrug.findById(id);
  if (!drug) notFound();

  const action = updateDrug.bind(null, drug.id);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Pharmacy", href: "/pharmacy" }, { label: "Edit" }]}
        title={`Edit Drug — ${drug.drugName}`}
      />
      <DrugForm
        action={action}
        submitLabel="Save Changes"
        defaults={{
          drug_name: drug.drugName,
          category: drug.category ?? undefined,
          description: drug.description ?? undefined,
          unit: drug.unit ?? undefined,
          unit_price: String(drug.unitPrice),
          quantity_in_stock: String(drug.quantityInStock),
          reorder_level: String(drug.reorderLevel),
        }}
      />
    </div>
  );
}

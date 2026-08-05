import { requireRole } from "@/lib/auth";
import { connectDB, Patient } from "@/models";
import { createBill } from "@/actions/billing";
import PageHeader from "@/components/ui/PageHeader";
import BillForm from "./BillForm";

export const metadata = { title: "New Bill - VITALS HMS" };

export default async function AddBillPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole(["admin", "receptionist"]);
  const params = await searchParams;

  await connectDB();
  const patients = await Patient.find().sort({ firstName: 1 });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Billing", href: "/billing" }, { label: "New" }]}
        title="New Bill"
      />
      <BillForm
        action={createBill}
        patients={patients.map((p) => ({ id: p.id, patientNumber: p.patientNumber, firstName: p.firstName, lastName: p.lastName }))}
        defaultPatientId={typeof params.patient_id === "string" ? params.patient_id : undefined}
        appointmentId={typeof params.appointment_id === "string" ? params.appointment_id : undefined}
      />
    </div>
  );
}

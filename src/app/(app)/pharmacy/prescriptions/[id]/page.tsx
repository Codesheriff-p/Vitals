import { notFound } from "next/navigation";
import Link from "next/link";
import { Pill } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, Prescription, PharmacyDrug } from "@/models";
import type { IPatient, IDoctor, IUser } from "@/models";
import { dispensePrescription } from "@/actions/pharmacy";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import { btnPrimary } from "@/components/ui/buttonStyles";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Prescription Details - VITALS HMS" };

type DoctorWithUser = IDoctor & { userId: IUser };

export default async function PrescriptionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireRole(["admin", "pharmacist", "doctor"]);
  const { id } = await params;
  const sp = await searchParams;

  await connectDB();

  const prescription = await Prescription.findById(id)
    .populate<{ patientId: IPatient }>("patientId")
    .populate<{ doctorId: DoctorWithUser }>({ path: "doctorId", populate: { path: "userId" } });
  if (!prescription || !prescription.patientId || !prescription.doctorId?.userId) notFound();

  const drugs = await PharmacyDrug.find({ _id: { $in: prescription.items.map((i) => i.drugId) } });
  const drugMap = new Map(drugs.map((d) => [d.id, d]));

  const canDispense = prescription.status === "pending" && ["admin", "pharmacist"].includes(user.role);
  const shortId = prescription.id.slice(-6);

  return (
    <div>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Pharmacy", href: "/pharmacy" },
          { label: "Prescriptions", href: "/pharmacy/prescriptions" },
          { label: `#${shortId}` },
        ]}
        title={`Prescription #${shortId}`}
        action={
          canDispense && (
            <form action={dispensePrescription.bind(null, prescription.id)}>
              <ConfirmSubmitButton
                confirmMessage="Dispense this prescription? Stock levels will be updated."
                confirmLabel="Dispense"
                tone="default"
                className={btnPrimary}
              >
                <Pill size={16} /> Dispense
              </ConfirmSubmitButton>
            </form>
          )
        }
      />

      <FlashMessages searchParams={sp} />

      <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Prescription Info</h2>
        <dl className="space-y-2 text-sm">
          <Row
            label="Patient"
            value={
              <Link href={`/patients/${prescription.patientId.id}`} className="text-trace-deep dark:text-trace hover:underline">
                {prescription.patientId.firstName} {prescription.patientId.lastName}
              </Link>
            }
          />
          <Row label="Patient #" value={prescription.patientId.patientNumber} />
          <Row label="Doctor" value={prescription.doctorId.userId.name} />
          <Row label="Status" value={<Badge tone={prescription.status === "dispensed" ? "success" : "warning"}>{prescription.status}</Badge>} />
          <Row label="Date" value={formatDate(prescription.createdAt)} />
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60">Drug Items</h2>
        {prescription.items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Drug</th>
                  <th className="py-2 pr-3">Dosage</th>
                  <th className="py-2 pr-3">Quantity</th>
                  <th className="py-2 pr-3">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {prescription.items.map((i) => {
                  const drug = drugMap.get(i.drugId.toString());
                  return (
                    <tr key={i.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                      <td className="py-2 pr-3 font-semibold">{drug?.drugName}</td>
                      <td className="py-2 pr-3">{i.dosage || "—"}</td>
                      <td className="py-2 pr-3">
                        {i.quantity} {drug?.unit}
                      </td>
                      <td className="py-2 pr-3">{i.instructions || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Pill} message="No drug items on this prescription." />
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400 dark:text-white">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

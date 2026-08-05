import Link from "next/link";
import { Plus, FileText, Pencil, Trash2, TriangleAlert, Pill } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, PharmacyDrug } from "@/models";
import { deleteDrug } from "@/actions/pharmacy";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import { btnPrimary, btnOutline, iconBtnOutline, iconBtnOutlineDanger, inputClass } from "@/components/ui/buttonStyles";
import { formatMoney } from "@/lib/format";
import { containsRegex } from "@/lib/mongoRegex";

export const metadata = { title: "Pharmacy - VITALS HMS" };

export default async function PharmacyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireRole(["admin", "pharmacist", "doctor"]);
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const lowStock = params.lowStock === "1";

  await connectDB();

  const searchFilter = search ? { $or: [{ drugName: containsRegex(search) }, { category: containsRegex(search) }] } : {};
  const lowStockFilter = lowStock ? { $expr: { $lte: ["$quantityInStock", "$reorderLevel"] } } : {};

  const drugs = await PharmacyDrug.find({ ...searchFilter, ...lowStockFilter }).sort({ drugName: 1 });

  const canManage = ["admin", "pharmacist"].includes(user.role);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Pharmacy" }]}
        title={lowStock ? "Drug Inventory — Low Stock" : "Drug Inventory"}
        action={
          <div className="flex gap-2">
            <Link href="/pharmacy/prescriptions" className={btnOutline}>
              <FileText size={16} /> Prescriptions
            </Link>
            {canManage && (
              <Link href="/pharmacy/add" className={btnPrimary}>
                <Plus size={16} /> Add Drug
              </Link>
            )}
          </div>
        }
      />

      <FlashMessages searchParams={params} />

      <form action="/pharmacy" method="GET" className="mb-4 flex gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        {lowStock && <input type="hidden" name="lowStock" value="1" />}
        <input type="text" name="search" defaultValue={search} placeholder="Search by drug name or category" className={inputClass} />
        <button type="submit" className={btnOutline}>
          Search
        </button>
        {lowStock && (
          <span className="flex items-center gap-1 rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
            <TriangleAlert size={12} /> Low stock only
          </span>
        )}
        {(search || lowStock) && (
          <Link href="/pharmacy" className="flex items-center text-sm text-slate-500 dark:text-white hover:text-trace-deep dark:hover:text-trace">
            Clear
          </Link>
        )}
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        {drugs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Drug Name</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Unit</th>
                  <th className="py-2 pr-3">Unit Price</th>
                  <th className="py-2 pr-3">In Stock</th>
                  <th className="py-2 pr-3">Reorder Level</th>
                  {canManage && <th className="py-2 pr-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {drugs.map((d) => {
                  const low = d.quantityInStock <= d.reorderLevel;
                  return (
                    <tr key={d.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                      <td className="py-2.5 pr-3 font-semibold">{d.drugName}</td>
                      <td className="py-2.5 pr-3">{d.category || "—"}</td>
                      <td className="py-2.5 pr-3">{d.unit || "—"}</td>
                      <td className="py-2.5 pr-3">{formatMoney(d.unitPrice)}</td>
                      <td className={`py-2.5 pr-3 ${low ? "font-semibold text-danger" : ""}`}>
                        <span className="inline-flex items-center gap-1">
                          {d.quantityInStock}
                          {low && <TriangleAlert size={14} />}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">{d.reorderLevel}</td>
                      {canManage && (
                        <td className="py-2.5 pr-3">
                          <div className="flex justify-end gap-1.5">
                            <Link href={`/pharmacy/${d.id}/edit`} title="Edit" className={iconBtnOutline}>
                              <Pencil size={14} />
                            </Link>
                            <form action={deleteDrug.bind(null, d.id)}>
                              <ConfirmSubmitButton
                                confirmMessage={`Delete ${d.drugName} from inventory?`}
                                className={iconBtnOutlineDanger}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </ConfirmSubmitButton>
                            </form>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Pill} message={lowStock ? "No low stock drugs found." : "No drugs found."} />
        )}
      </div>
    </div>
  );
}

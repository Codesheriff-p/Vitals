import Link from "next/link";
import { Plus, ClipboardList, Pencil, Trash2, FlaskConical } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, LabTest } from "@/models";
import { deleteLabTest } from "@/actions/laboratory";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import { btnPrimary, btnOutline, iconBtnOutline, iconBtnOutlineDanger, inputClass } from "@/components/ui/buttonStyles";
import { formatMoney } from "@/lib/format";
import { containsRegex } from "@/lib/mongoRegex";

export const metadata = { title: "Laboratory - VITALS HMS" };

export default async function LaboratoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireRole(["admin", "lab_technician", "doctor"]);
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";

  await connectDB();

  const tests = await LabTest.find(search ? { testName: containsRegex(search) } : {}).sort({ testName: 1 });

  const canManage = ["admin", "lab_technician"].includes(user.role);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Laboratory" }]}
        title="Lab Test Catalog"
        action={
          <div className="flex gap-2">
            <Link href="/laboratory/requests" className={btnOutline}>
              <ClipboardList size={16} /> Requests
            </Link>
            {canManage && (
              <Link href="/laboratory/add" className={btnPrimary}>
                <Plus size={16} /> Add Test
              </Link>
            )}
          </div>
        }
      />

      <FlashMessages searchParams={params} />

      <form action="/laboratory" method="GET" className="mb-4 flex gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <input type="text" name="search" defaultValue={search} placeholder="Search by test name" className={inputClass} />
        <button type="submit" className={btnOutline}>
          Search
        </button>
        {search && (
          <Link href="/laboratory" className="flex items-center text-sm text-slate-500 dark:text-white hover:text-trace-deep dark:hover:text-trace">
            Clear
          </Link>
        )}
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        {tests.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Test Name</th>
                  <th className="py-2 pr-3">Normal Range</th>
                  <th className="py-2 pr-3">Unit</th>
                  <th className="py-2 pr-3">Price</th>
                  {canManage && <th className="py-2 pr-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2.5 pr-3 font-semibold">{t.testName}</td>
                    <td className="py-2.5 pr-3">{t.normalRange || "—"}</td>
                    <td className="py-2.5 pr-3">{t.unit || "—"}</td>
                    <td className="py-2.5 pr-3">{formatMoney(t.price)}</td>
                    {canManage && (
                      <td className="py-2.5 pr-3">
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/laboratory/${t.id}/edit`} title="Edit" className={iconBtnOutline}>
                            <Pencil size={14} />
                          </Link>
                          <form action={deleteLabTest.bind(null, t.id)}>
                            <ConfirmSubmitButton
                              confirmMessage={`Delete ${t.testName} from the catalog?`}
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
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={FlaskConical} message="No lab tests found." />
        )}
      </div>
    </div>
  );
}

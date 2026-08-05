import Link from "next/link";
import { Plus, MoreVertical, BadgeCheck, UserCog, UserCheck, Network } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, Department, Doctor, Staff } from "@/models";
import type { IUser } from "@/models";
import { deleteDepartment } from "@/actions/departments";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import { btnPrimary } from "@/components/ui/buttonStyles";

export const metadata = { title: "Departments - VITALS HMS" };

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  await connectDB();

  const departments = await Department.find()
    .populate<{ headDoctorId: { userId: IUser } | null }>({ path: "headDoctorId", populate: { path: "userId" } })
    .sort({ name: 1 });

  const counts = await Promise.all(
    departments.map(async (d) => ({
      id: d.id,
      doctorCount: await Doctor.countDocuments({ departmentId: d.id }),
      staffCount: await Staff.countDocuments({ departmentId: d.id }),
    }))
  );
  const countMap = new Map(counts.map((c) => [c.id, c]));

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Departments" }]}
        title="Departments"
        action={
          <Link href="/departments/add" className={btnPrimary}>
            <Plus size={16} /> Add Department
          </Link>
        }
      />

      <FlashMessages searchParams={params} />

      {departments.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => {
            const count = countMap.get(d.id);
            return (
              <div key={d.id} className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
                <div className="mb-2 flex items-start justify-between">
                  <h2 className="font-semibold text-slate-800 dark:text-white">{d.name}</h2>
                  <DeptMenu id={d.id} name={d.name} />
                </div>
                <p className="mb-3 flex-1 text-sm text-slate-500 dark:text-white">{d.description || "No description provided."}</p>
                <div className="flex justify-between border-t border-slate-100 dark:border-white/5 pt-2 text-xs text-slate-500 dark:text-white">
                  <span className="flex items-center gap-1">
                    <BadgeCheck size={14} /> {count?.doctorCount ?? 0} Doctor(s)
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCog size={14} /> {count?.staffCount ?? 0} Staff
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-white">
                  <UserCheck size={14} />
                  Head: {d.headDoctorId?.userId ? d.headDoctorId.userId.name : "Unassigned"}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
          <EmptyState icon={Network} message="No departments found." />
        </div>
      )}
    </div>
  );
}

function DeptMenu({ id, name }: { id: string; name: string }) {
  return (
    <div className="group relative">
      <button className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5">
        <MoreVertical size={16} />
      </button>
      <div className="invisible absolute right-0 z-10 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <Link href={`/departments/${id}/edit`} className="block px-3 py-1.5 text-sm text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5">
          Edit
        </Link>
        <form action={deleteDepartment.bind(null, id)}>
          <ConfirmSubmitButton
            confirmMessage={`Delete the ${name} department?`}
            className="block w-full px-3 py-1.5 text-left text-sm text-danger hover:bg-danger/5 dark:text-danger-bright dark:hover:bg-danger-bright/10"
          >
            Delete
          </ConfirmSubmitButton>
        </form>
      </div>
    </div>
  );
}

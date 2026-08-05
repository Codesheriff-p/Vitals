import Link from "next/link";
import { Plus, Eye, Pencil, Trash2, BadgeCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { connectDB, Doctor, Department } from "@/models";
import type { IUser, IDepartment } from "@/models";
import { deleteDoctor } from "@/actions/doctors";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import ViewToggle from "@/components/ui/ViewToggle";
import DoctorCard from "@/components/ui/DoctorCard";
import Avatar from "@/components/ui/Avatar";
import { btnPrimary, iconBtnOutline, iconBtnOutlineDanger } from "@/components/ui/buttonStyles";
import { toPhotoDataUrl } from "@/lib/image";

export const metadata = { title: "Doctors - VITALS HMS" };

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const departmentId = typeof params.department_id === "string" ? params.department_id : "";
  const view = params.view === "table" ? "table" : "cards";

  await connectDB();

  const filter = departmentId ? { departmentId } : {};

  const [doctors, departments] = await Promise.all([
    Doctor.find(filter)
      .select("+photo +photoContentType")
      .populate<{ userId: IUser }>("userId")
      .populate<{ departmentId: IDepartment | null }>("departmentId"),
    Department.find().sort({ name: 1 }),
  ]);

  doctors.sort((a, b) => a.userId.name.localeCompare(b.userId.name));

  const canManage = user.role === "admin";

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Doctors" }]}
        title="Doctors"
        action={
          canManage && (
            <Link href="/doctors/add" className={btnPrimary}>
              <Plus size={16} /> Add Doctor
            </Link>
          )
        }
      />

      <FlashMessages searchParams={params} />

      <form action="/doctors" method="GET" className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <div className="max-w-xs flex-1 min-w-[200px]">
          <Select
            name="department_id"
            defaultValue={departmentId}
            autoSubmit
            options={[{ value: "", label: "All Departments" }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
          />
        </div>
        <div className="ml-auto">
          <ViewToggle basePath="/doctors" current={view} searchParams={params} />
        </div>
      </form>

      {doctors.length ? (
        view === "cards" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d) => (
              <DoctorCard
                key={d.id}
                doctor={{
                  id: d.id,
                  name: d.userId.name,
                  specialization: d.specialization,
                  qualification: d.qualification,
                  phone: d.phone,
                  email: d.userId.email,
                  department: d.departmentId?.name ?? null,
                  status: d.status,
                  photoUrl: toPhotoDataUrl(d.photo, d.photoContentType),
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Specialization</th>
                    <th className="py-2 pr-3">Department</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                      <td className="py-2.5 pr-3 font-semibold">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={toPhotoDataUrl(d.photo, d.photoContentType)} name={d.userId.name} size="sm" />
                          {d.userId.name}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">{d.specialization}</td>
                      <td className="py-2.5 pr-3">{d.departmentId?.name || "—"}</td>
                      <td className="py-2.5 pr-3">{d.phone || "—"}</td>
                      <td className="py-2.5 pr-3">
                        <Badge tone={d.status === "active" ? "success" : "danger"}>{d.status}</Badge>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/doctors/${d.id}`} title="View" className={iconBtnOutline}>
                            <Eye size={14} />
                          </Link>
                          {canManage && (
                            <>
                              <Link href={`/doctors/${d.id}/edit`} title="Edit" className={iconBtnOutline}>
                                <Pencil size={14} />
                              </Link>
                              <form action={deleteDoctor.bind(null, d.id)}>
                                <ConfirmSubmitButton
                                  confirmMessage={`Remove ${d.userId.name}? This cannot be undone.`}
                                  className={iconBtnOutlineDanger}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </ConfirmSubmitButton>
                              </form>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
          <EmptyState icon={BadgeCheck} message="No doctors found." />
        </div>
      )}
    </div>
  );
}

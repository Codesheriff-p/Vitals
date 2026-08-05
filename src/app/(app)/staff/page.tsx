import Link from "next/link";
import { Plus, Pencil, Trash2, UserCog } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, Staff, User } from "@/models";
import type { IUser, IDepartment } from "@/models";
import { deleteStaff } from "@/actions/staff";
import { STAFF_ROLES } from "@/lib/staffRoles";
import type { UserRole } from "@/types/auth";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import Avatar from "@/components/ui/Avatar";
import { btnPrimary, iconBtnOutline, iconBtnOutlineDanger } from "@/components/ui/buttonStyles";
import { toPhotoDataUrl } from "@/lib/image";

export const metadata = { title: "Staff - VITALS HMS" };

function roleLabel(r: string) {
  return r.replace("_", " ");
}

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const roleFilter = typeof params.role === "string" && (STAFF_ROLES as string[]).includes(params.role) ? params.role : "";

  await connectDB();

  let staffFilter = {};
  if (roleFilter) {
    const matchingUsers = await User.find({ role: roleFilter as UserRole }).select("_id");
    staffFilter = { userId: { $in: matchingUsers.map((u) => u._id) } };
  }

  const staff = await Staff.find(staffFilter)
    .select("+photo +photoContentType")
    .populate<{ userId: IUser }>("userId")
    .populate<{ departmentId: IDepartment | null }>("departmentId");

  staff.sort((a, b) => a.userId.name.localeCompare(b.userId.name));

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Staff" }]}
        title="Staff"
        action={
          <Link href="/staff/add" className={btnPrimary}>
            <Plus size={16} /> Add Staff
          </Link>
        }
      />

      <FlashMessages searchParams={params} />

      <form action="/staff" method="GET" className="mb-4 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <div className="max-w-xs">
          <Select
            name="role"
            defaultValue={roleFilter}
            autoSubmit
            options={[{ value: "", label: "All Roles" }, ...STAFF_ROLES.map((r) => ({ value: r, label: roleLabel(r) }))]}
          />
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        {staff.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Department</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2.5 pr-3 font-semibold">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={toPhotoDataUrl(s.photo, s.photoContentType)} name={s.userId.name} size="sm" />
                        {s.userId.name}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 capitalize">{roleLabel(s.userId.role)}</td>
                    <td className="py-2.5 pr-3">{s.roleTitle || "—"}</td>
                    <td className="py-2.5 pr-3">{s.departmentId?.name || "—"}</td>
                    <td className="py-2.5 pr-3">{s.phone || "—"}</td>
                    <td className="py-2.5 pr-3">
                      <Badge tone={s.status === "active" ? "success" : "danger"}>{s.status}</Badge>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/staff/${s.id}/edit`} title="Edit" className={iconBtnOutline}>
                          <Pencil size={14} />
                        </Link>
                        <form action={deleteStaff.bind(null, s.id)}>
                          <ConfirmSubmitButton
                            confirmMessage={`Remove ${s.userId.name} from staff?`}
                            className={iconBtnOutlineDanger}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={UserCog} message="No staff members found." />
        )}
      </div>
    </div>
  );
}

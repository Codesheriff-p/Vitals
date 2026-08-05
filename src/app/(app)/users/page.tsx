import Link from "next/link";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { connectDB, User } from "@/models";
import type { UserRole } from "@/types/auth";
import { deleteUser } from "@/actions/users";
import { ALL_ROLES, roleLabel } from "@/lib/userRoles";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import Avatar from "@/components/ui/Avatar";
import { btnPrimary, iconBtnOutline, iconBtnOutlineDanger } from "@/components/ui/buttonStyles";
import { formatDate } from "@/lib/format";
import { toPhotoDataUrl } from "@/lib/image";

export const metadata = { title: "Users - VITALS HMS" };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentUser = await requireRole(["admin"]);
  const params = await searchParams;
  const roleFilter = typeof params.role === "string" && (ALL_ROLES as string[]).includes(params.role) ? params.role : "";

  await connectDB();

  const users = await User.find(roleFilter ? { role: roleFilter as UserRole } : {})
    .select("+photo +photoContentType")
    .sort({ name: 1 });

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Users" }]}
        title="Users"
        action={
          <Link href="/users/add" className={btnPrimary}>
            <Plus size={16} /> Add User
          </Link>
        }
      />

      <FlashMessages searchParams={params} />

      <form action="/users" method="GET" className="mb-4 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <div className="max-w-xs">
          <Select
            name="role"
            defaultValue={roleFilter}
            autoSubmit
            options={[{ value: "", label: "All Roles" }, ...ALL_ROLES.map((r) => ({ value: r, label: roleLabel(r) }))]}
          />
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        {users.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Joined</th>
                  <th className="py-2 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="py-2.5 pr-3 font-semibold">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={toPhotoDataUrl(u.photo, u.photoContentType)} name={u.name} size="sm" />
                        {u.name}
                        {u.id === currentUser.id && <span className="ml-1 text-xs font-normal text-slate-400 dark:text-white">(you)</span>}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">{u.email}</td>
                    <td className="py-2.5 pr-3 capitalize">{roleLabel(u.role)}</td>
                    <td className="py-2.5 pr-3">
                      <Badge tone={u.status === "active" ? "success" : "danger"}>{u.status}</Badge>
                    </td>
                    <td className="py-2.5 pr-3">{formatDate(u.createdAt)}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex justify-end gap-1.5">
                        <Link href={`/users/${u.id}/edit`} title="Edit" className={iconBtnOutline}>
                          <Pencil size={14} />
                        </Link>
                        {u.id !== currentUser.id && (
                          <form action={deleteUser.bind(null, u.id)}>
                            <ConfirmSubmitButton
                              confirmMessage={`Delete ${u.name}'s account? This cannot be undone.`}
                              className={iconBtnOutlineDanger}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </ConfirmSubmitButton>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={ShieldCheck} message="No users found." />
        )}
      </div>
    </div>
  );
}

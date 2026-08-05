import { requireRole } from "@/lib/auth";
import { createUser } from "@/actions/users";
import PageHeader from "@/components/ui/PageHeader";
import UserForm from "../UserForm";

export const metadata = { title: "Add User - VITALS HMS" };

export default async function AddUserPage() {
  await requireRole(["admin"]);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Users", href: "/users" }, { label: "Add" }]}
        title="Add User"
      />
      <UserForm action={createUser} submitLabel="Save User" passwordRequired />
    </div>
  );
}

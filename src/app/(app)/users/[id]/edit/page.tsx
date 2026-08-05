import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { connectDB, User } from "@/models";
import { updateUser } from "@/actions/users";
import PageHeader from "@/components/ui/PageHeader";
import { toPhotoDataUrl } from "@/lib/image";
import UserForm from "../../UserForm";

export const metadata = { title: "Edit User - VITALS HMS" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin"]);
  const { id } = await params;

  await connectDB();
  const user = await User.findById(id).select("+photo +photoContentType");
  if (!user) notFound();

  const action = updateUser.bind(null, user.id);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Home", href: "/dashboard" }, { label: "Users", href: "/users" }, { label: "Edit" }]}
        title={`Edit User — ${user.name}`}
      />
      <UserForm
        action={action}
        submitLabel="Save Changes"
        showStatus
        defaults={{
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          photo: toPhotoDataUrl(user.photo, user.photoContentType),
        }}
      />
    </div>
  );
}

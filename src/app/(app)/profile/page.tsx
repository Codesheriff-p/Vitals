import { requireUser } from "@/lib/auth";
import { connectDB, User } from "@/models";
import { updateOwnProfile } from "@/actions/profile";
import { toPhotoDataUrl } from "@/lib/image";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessages from "@/components/ui/FlashMessages";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "My Profile - VITALS HMS" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentUser = await requireUser();
  const params = await searchParams;

  await connectDB();

  const user = await User.findById(currentUser.id).select("+photo +photoContentType");
  if (!user) throw new Error("User not found.");

  return (
    <div>
      <PageHeader crumbs={[{ label: "Home", href: "/dashboard" }, { label: "My Profile" }]} title="My Profile" />

      <FlashMessages searchParams={params} />

      <ProfileForm
        action={updateOwnProfile}
        defaults={{
          name: user.name,
          email: user.email,
          role: user.role.replace("_", " "),
          phone: user.phone ?? undefined,
          dob: user.dob ? user.dob.toISOString().slice(0, 10) : undefined,
          photo: toPhotoDataUrl(user.photo, user.photoContentType),
        }}
      />
    </div>
  );
}

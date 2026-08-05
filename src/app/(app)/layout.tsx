import { requireUser } from "@/lib/auth";
import { connectDB, User } from "@/models";
import { toPhotoDataUrl } from "@/lib/image";
import AppShell from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  await connectDB();
  const account = await User.findById(user.id).select("+photo +photoContentType");
  const photoUrl = toPhotoDataUrl(account?.photo, account?.photoContentType);

  return (
    <AppShell user={user} photoUrl={photoUrl}>
      {children}
    </AppShell>
  );
}

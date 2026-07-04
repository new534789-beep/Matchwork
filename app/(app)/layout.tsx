import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/navigation/AppShell";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const userId = (session.user as { id?: string }).id;
  if (userId) {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { suspendu: true } });
    if (u?.suspendu) redirect("/connexion?suspendu=1");
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <AppShell userEmail={session.user.email ?? ""} role={(session.user as { role?: string }).role}>{children}</AppShell>
    </div>
  );
}

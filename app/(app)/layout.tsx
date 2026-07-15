import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/navigation/AppShell";
import { SessionTrackerWrapper } from "@/components/admin/SessionTrackerWrapper";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const userId = (session.user as { id?: string }).id;
  let justSignedUp = false;
  if (userId) {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { suspendu: true, createdAt: true } });
    if (u?.suspendu) redirect("/connexion?suspendu=1");
    // Compte créé il y a moins de 5 min → on propose l'installation PWA.
    justSignedUp = !!u && Date.now() - u.createdAt.getTime() < 5 * 60 * 1000;
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <SessionTrackerWrapper />
      <AppShell userEmail={session.user.email ?? ""} role={(session.user as { role?: string }).role} justSignedUp={justSignedUp}>{children}</AppShell>
    </div>
  );
}

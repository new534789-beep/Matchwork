import { sessionCourante, getUtilisateur } from "@/lib/session";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/navigation/AppShell";
import { SessionTrackerWrapper } from "@/components/admin/SessionTrackerWrapper";
import { GenerationProvider } from "@/lib/generation/GenerationContext";
import { ToastProvider } from "@/components/ui/Toast";

/** Compte créé il y a moins de 5 min → on propose l'installation PWA. */
function estNouveauCompte(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() < 5 * 60 * 1000;
}

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const session = await sessionCourante();
  if (!session?.user) redirect("/connexion");

  const userId = (session.user as { id?: string }).id;
  let justSignedUp = false;
  if (userId) {
    const u = await getUtilisateur(userId);
    if (u?.suspendu) redirect("/connexion?suspendu=1");
    justSignedUp = !!u && estNouveauCompte(u.createdAt);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <GenerationProvider>
        <ToastProvider>
          <SessionTrackerWrapper />
          <AppShell userEmail={session.user.email ?? ""} role={(session.user as { role?: string }).role} justSignedUp={justSignedUp}>{children}</AppShell>
        </ToastProvider>
      </GenerationProvider>
    </div>
  );
}

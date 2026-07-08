import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";

/**
 * Coquille de l'espace d'administration.
 * Double protection (en plus du middleware Edge) : on revérifie le rôle côté serveur.
 * Tout non-admin est renvoyé hors de /admin — cette URL donne accès à tout.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) redirect("/connexion?from=/admin");
  if (role !== "admin") redirect("/tableau-de-bord");

  const [aValiderCount, supportNonLus] = await Promise.all([
    prisma.opportunite.count({ where: { statut: "a_valider" } }),
    prisma.message.count({ where: { auteur: "candidat", lu: false } }),
  ]);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <AdminNav email={session.user.email ?? ""} aValiderCount={aValiderCount} supportNonLus={supportNonLus} />
      <div className="flex-1 flex flex-col min-w-0 admin-content-offset">{children}</div>
    </div>
  );
}

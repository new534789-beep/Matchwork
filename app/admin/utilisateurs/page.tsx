import { prisma } from "@/lib/prisma";
import { EnteteAdmin } from "@/components/admin/EnteteAdmin";
import { GestionUtilisateurs } from "@/components/admin/GestionUtilisateurs";

export const dynamic = "force-dynamic";

export default async function PageUtilisateurs() {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      plan: true,
      role: true,
      suspendu: true,
      createdAt: true,
      _count: { select: { dossiers: true, documents: true } },
    },
  });

  const initial = rows.map((u) => ({
    id: u.id,
    email: u.email,
    plan: u.plan,
    role: u.role,
    suspendu: u.suspendu,
    createdAt: u.createdAt.toISOString(),
    nbDossiers: u._count.dossiers,
    nbDocuments: u._count.documents,
  }));

  return (
    <>
      <EnteteAdmin titre="Utilisateurs" sousTitre={`${initial.length} compte${initial.length > 1 ? "s" : ""}`} />
      <main className="flex-1 px-5 sm:px-8 py-6 w-full" style={{ maxWidth: 900 }}>
        <GestionUtilisateurs initial={initial} />
      </main>
    </>
  );
}

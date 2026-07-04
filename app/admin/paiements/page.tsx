import { prisma } from "@/lib/prisma";
import { EnteteAdmin } from "@/components/admin/EnteteAdmin";
import { GestionPaiements } from "@/components/admin/GestionPaiements";
import { getQuotaGratuit } from "@/lib/parametres";

export const dynamic = "force-dynamic";

export default async function PagePaiements() {
  const mois = new Date().toISOString().slice(0, 7);
  const [paiements, users, quotaMax] = await Promise.all([
    prisma.paiement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { email: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, plan: true, quotas: { where: { mois }, select: { generationsUtilisees: true } } },
    }),
    getQuotaGratuit(),
  ]);

  const pRows = paiements.map((p) => ({
    id: p.id,
    email: p.user.email,
    montant: p.montant,
    fournisseur: p.fournisseur,
    statut: p.statut,
    createdAt: p.createdAt.toISOString(),
  }));

  const comptes = users.map((u) => ({
    id: u.id,
    email: u.email,
    plan: u.plan,
    quota: u.quotas[0]?.generationsUtilisees ?? 0,
  }));

  return (
    <>
      <EnteteAdmin titre="Paiements & quotas" sousTitre="Transactions mobile money, plans et quotas" />
      <main className="flex-1 px-5 sm:px-8 py-6 w-full" style={{ maxWidth: 900 }}>
        <GestionPaiements paiements={pRows} comptes={comptes} quotaMax={quotaMax} />
      </main>
    </>
  );
}

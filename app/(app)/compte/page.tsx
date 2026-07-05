import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { CompteClient } from "./CompteClient";

export default async function Compte() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const userId = session.user.id;
  const mois = new Date().toISOString().slice(0, 10);
  const quotaMax = parseInt(process.env.QUOTA_GRATUIT_JOURNALIER ?? "3") || 3;

  const [user, quota, paiements] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true, email: true } }),
    prisma.quotaUsage.findUnique({ where: { userId_mois: { userId, mois } } }),
    prisma.paiement.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const planActuel = user?.plan ?? "gratuit";
  const estGratuit = planActuel === "gratuit" || planActuel === "GRATUIT";
  const generationsUtilisees = quota?.generationsUtilisees ?? 0;
  const quotaRestant = estGratuit ? Math.max(0, quotaMax - generationsUtilisees) : null;

  return (
    <>
      <EnteteApp titre="Mon compte" />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl mx-auto w-full">
        <CompteClient
          email={user?.email ?? ""}
          plan={planActuel}
          quotaMax={quotaMax}
          generationsUtilisees={generationsUtilisees}
          quotaRestant={quotaRestant}
          paiements={paiements.map((p) => ({
            id: p.id,
            montant: p.montant,
            fournisseur: p.fournisseur,
            statut: p.statut,
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      </main>
    </>
  );
}

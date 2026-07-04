import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { DetailClient } from "./DetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function DetailOpportunite({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { id } = await params;

  const [opportunite, interaction, dossier, quota] = await Promise.all([
    prisma.opportunite.findUnique({ where: { id } }),
    prisma.interaction.findUnique({
      where: { userId_opportuniteId: { userId: session.user.id, opportuniteId: id } },
      select: { decision: true },
    }),
    prisma.dossier.findFirst({
      where: { userId: session.user.id, opportuniteId: id },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quotaUsage.findUnique({
      where: { userId_mois: { userId: session.user.id, mois: new Date().toISOString().slice(0, 7) } },
    }),
  ]);

  if (!opportunite) notFound();

  const piecesParsees = (() => {
    try {
      return JSON.parse(opportunite.piecesExigees) as { nom: string; obligatoire: boolean }[];
    } catch {
      return [];
    }
  })();

  const quotaMax = parseInt(process.env.QUOTA_GRATUIT_MENSUEL ?? "3") || 3;
  const quotaRestant = Math.max(0, quotaMax - (quota?.generationsUtilisees ?? 0));

  return (
    <>
      <EnteteApp titre="Détail de la bourse" retour="/opportunites" />
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <DetailClient
          opportunite={{
            id: opportunite.id,
            organisme: opportunite.organisme,
            intitule: opportunite.intitule,
            description: opportunite.description,
            langueDetectee: opportunite.langueDetectee,
            conditions: opportunite.conditions,
            piecesExigees: piecesParsees,
            exigenceLangue: opportunite.exigenceLangue,
            dateLimite: opportunite.dateLimite?.toISOString() ?? null,
            lien: opportunite.lien,
            source: opportunite.source,
          }}
          decisionInitiale={interaction?.decision ?? null}
          dossierId={dossier?.id ?? null}
          quotaRestant={quotaRestant}
        />
      </main>
    </>
  );
}

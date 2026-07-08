import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EnteteApp } from "@/components/navigation/EnteteApp";
import { DetailClient } from "./DetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const opp = await prisma.opportunite.findUnique({
    where: { id },
    select: { intitule: true, organisme: true, description: true },
  });
  if (!opp) return { title: "Offre introuvable" };

  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const title = `${opp.intitule} — ${opp.organisme}`;
  const description = opp.description.slice(0, 200);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${baseUrl}/opportunites/${id}`,
      images: [{ url: `${baseUrl}/api/og/${id}`, width: 1200, height: 630, alt: title }],
      siteName: "Matchwork",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/api/og/${id}`],
    },
  };
}

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
      where: { userId: session.user.id, opportuniteId: id, statut: { not: "a_preparer" } },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quotaUsage.findUnique({
      where: { userId_mois: { userId: session.user.id, mois: new Date().toISOString().slice(0, 10) } },
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

  const quotaMax = parseInt(process.env.QUOTA_GRATUIT_JOURNALIER ?? "3") || 3;
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

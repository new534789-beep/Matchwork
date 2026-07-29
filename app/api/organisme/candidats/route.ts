import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Liste des candidats ayant interagi avec les offres de l'organisme connecté
// (swipé "intéressé" ou généré un dossier) — sert de base à la gestion des
// candidatures et à la messagerie côté organisme. Ne renvoie jamais l'e-mail
// du candidat : l'organisme le contacte via la messagerie interne, pas en
// dehors de Matchwork.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const organisme = await prisma.organisme.findUnique({ where: { userId: session.user.id } });
  if (!organisme) {
    return NextResponse.json({ erreur: "Organisme introuvable" }, { status: 403 });
  }

  const opportunites = await prisma.opportunite.findMany({
    where: { organisme: organisme.nom, source: "portail_b2b" },
    select: { id: true, intitule: true },
  });
  const oppParId = new Map(opportunites.map((o) => [o.id, o.intitule]));
  const oppIds = opportunites.map((o) => o.id);

  if (oppIds.length === 0) {
    return NextResponse.json({ candidats: [] });
  }

  const [interactions, dossiers] = await Promise.all([
    prisma.interaction.findMany({
      where: { opportuniteId: { in: oppIds }, decision: "interesse" },
      select: { userId: true, opportuniteId: true, createdAt: true },
    }),
    prisma.dossier.findMany({
      where: { opportuniteId: { in: oppIds } },
      select: { userId: true, opportuniteId: true, statut: true, updatedAt: true },
    }),
  ]);

  type Entree = { userId: string; opportunites: Set<string>; meilleurStatut: string; derniereActivite: Date };
  const parCandidat = new Map<string, Entree>();

  const ORDRE_STATUT: Record<string, number> = { obtenu: 4, utilise: 3, genere: 2, a_preparer: 1, interesse: 0 };

  function noter(userId: string, opportuniteId: string, statut: string, date: Date) {
    const e = parCandidat.get(userId) ?? { userId, opportunites: new Set(), meilleurStatut: "interesse", derniereActivite: date };
    e.opportunites.add(opportuniteId);
    if ((ORDRE_STATUT[statut] ?? 0) > (ORDRE_STATUT[e.meilleurStatut] ?? 0)) e.meilleurStatut = statut;
    if (date > e.derniereActivite) e.derniereActivite = date;
    parCandidat.set(userId, e);
  }

  for (const i of interactions) noter(i.userId, i.opportuniteId, "interesse", i.createdAt);
  for (const d of dossiers) noter(d.userId, d.opportuniteId, d.statut, d.updatedAt);

  const candidatIds = [...parCandidat.keys()];

  const [profils, messagesNonLus] = await Promise.all([
    prisma.profil.findMany({
      where: { userId: { in: candidatIds }, actif: true },
      select: { userId: true, nomComplet: true },
    }),
    prisma.message.groupBy({
      by: ["userId"],
      where: { organismeId: organisme.id, auteur: "candidat", lu: false },
      _count: true,
    }),
  ]);
  const nomParUser = new Map(profils.map((p) => [p.userId, p.nomComplet]));
  const nonLusParUser = new Map(messagesNonLus.map((m) => [m.userId, m._count]));

  const candidats = [...parCandidat.values()]
    .sort((a, b) => b.derniereActivite.getTime() - a.derniereActivite.getTime())
    .map((e) => ({
      userId: e.userId,
      nom: nomParUser.get(e.userId)?.trim() || "Candidat sans nom renseigné",
      offres: [...e.opportunites].map((id) => oppParId.get(id)).filter(Boolean),
      statut: e.meilleurStatut,
      derniereActivite: e.derniereActivite.toISOString(),
      messagesNonLus: nonLusParUser.get(e.userId) ?? 0,
    }));

  return NextResponse.json({ candidats });
}

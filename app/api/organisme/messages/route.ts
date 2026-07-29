import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOrganismeConnecte() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.organisme.findUnique({ where: { userId: session.user.id } });
}

// Un organisme ne peut voir/écrire à un candidat que si celui-ci a
// effectivement interagi avec une de ses offres (swipe "intéressé" ou
// dossier) — empêche de contacter un utilisateur au hasard via l'API.
async function candidatAutorise(organismeNom: string, candidatId: string): Promise<boolean> {
  const [interaction, dossier] = await Promise.all([
    prisma.interaction.findFirst({
      where: { userId: candidatId, decision: "interesse", opportunite: { organisme: organismeNom, source: "portail_b2b" } },
      select: { id: true },
    }),
    prisma.dossier.findFirst({
      where: { userId: candidatId, opportunite: { organisme: organismeNom, source: "portail_b2b" } },
      select: { id: true },
    }),
  ]);
  return !!interaction || !!dossier;
}

export async function GET(req: NextRequest) {
  const organisme = await getOrganismeConnecte();
  if (!organisme) return NextResponse.json({ erreur: "Organisme introuvable" }, { status: 403 });

  const candidatId = req.nextUrl.searchParams.get("candidatId");
  if (!candidatId) return NextResponse.json({ erreur: "candidatId manquant" }, { status: 400 });

  if (!(await candidatAutorise(organisme.nom, candidatId))) {
    return NextResponse.json({ erreur: "Ce candidat n'a interagi avec aucune de vos offres" }, { status: 403 });
  }

  // Compat messages candidat pré-migration : rattachés par nomAuteur avant
  // l'ajout d'organismeId, jamais réécrits rétroactivement.
  const messages = await prisma.message.findMany({
    where: { userId: candidatId, OR: [{ organismeId: organisme.id }, { nomAuteur: organisme.nom }] },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { userId: candidatId, organismeId: organisme.id, auteur: "candidat", lu: false },
    data: { lu: true },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id, auteur: m.auteur, nomAuteur: m.nomAuteur, contenu: m.contenu, createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const organisme = await getOrganismeConnecte();
  if (!organisme) return NextResponse.json({ erreur: "Organisme introuvable" }, { status: 403 });

  const { candidatId, contenu } = (await req.json()) as { candidatId?: string; contenu?: string };
  if (!candidatId) return NextResponse.json({ erreur: "candidatId manquant" }, { status: 400 });
  if (!contenu?.trim()) return NextResponse.json({ erreur: "Message vide" }, { status: 400 });
  if (contenu.trim().length > 4000) return NextResponse.json({ erreur: "Message trop long (4000 caractères max)." }, { status: 400 });

  if (!(await candidatAutorise(organisme.nom, candidatId))) {
    return NextResponse.json({ erreur: "Ce candidat n'a interagi avec aucune de vos offres" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      userId: candidatId,
      auteur: "organisme",
      nomAuteur: organisme.nom,
      organismeId: organisme.id,
      contenu: contenu.trim(),
      lu: false,
    },
  });

  return NextResponse.json({
    id: message.id, auteur: message.auteur, nomAuteur: message.nomAuteur, contenu: message.contenu, createdAt: message.createdAt.toISOString(),
  });
}

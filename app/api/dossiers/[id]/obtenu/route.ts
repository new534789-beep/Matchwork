import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererEtapesPostObtention } from "@/lib/checklist-post-obtention";

type Props = { params: Promise<{ id: string }> };

// Marque un dossier comme « obtenu » (auto-déclaré par le candidat — aucune
// détection automatique de résultat) et génère la checklist post-obtention
// une seule fois (idempotent : un second appel ne duplique pas les étapes).
export async function POST(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }
  const { id } = await params;

  const dossier = await prisma.dossier.findUnique({
    where: { id },
    select: { userId: true, statut: true, opportunite: { select: { type: true } }, etapesPostObtention: { select: { id: true } } },
  });
  if (!dossier || dossier.userId !== session.user.id) {
    return NextResponse.json({ erreur: "Dossier introuvable" }, { status: 404 });
  }

  if (dossier.statut !== "obtenu") {
    await prisma.dossier.update({ where: { id }, data: { statut: "obtenu", dateObtention: new Date() } });
  }

  if (dossier.etapesPostObtention.length === 0) {
    const etapes = genererEtapesPostObtention(dossier.opportunite.type);
    await prisma.etapePostObtention.createMany({
      data: etapes.map((e, i) => ({ dossierId: id, texte: e.texte, lienGuide: e.lienGuide ?? null, ordre: i })),
    });
  }

  const etapesFinales = await prisma.etapePostObtention.findMany({ where: { dossierId: id }, orderBy: { ordre: "asc" } });
  return NextResponse.json({ ok: true, etapes: etapesFinales });
}

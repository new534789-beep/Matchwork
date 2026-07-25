import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { envoyerNotification } from "@/lib/push/envoyer";

export const maxDuration = 60;

// Rappel unique, 5 jours après avoir marqué un dossier « obtenu », si des
// étapes de la checklist post-obtention (visa, documents, logement...)
// restent à cocher. Un seul rappel par dossier (voir checklistRelanceEnvoyeeLe).
const DELAI_JOURS = 5;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const avant = new Date(Date.now() - DELAI_JOURS * 86400000);

  const dossiers = await prisma.dossier.findMany({
    where: {
      statut: "obtenu",
      dateObtention: { lte: avant },
      checklistRelanceEnvoyeeLe: null,
      etapesPostObtention: { some: { fait: false } },
    },
    select: {
      id: true,
      userId: true,
      opportunite: { select: { intitule: true, organisme: true } },
      _count: { select: { etapesPostObtention: { where: { fait: false } } } },
    },
  });

  let envoyees = 0;
  for (const d of dossiers) {
    await envoyerNotification(d.userId, {
      title: "Il vous reste des étapes à compléter",
      body: `${d._count.etapesPostObtention} étape(s) en attente pour ${d.opportunite.organisme}.`,
      url: `/dossiers/${d.id}`,
    });
    await prisma.dossier.update({ where: { id: d.id }, data: { checklistRelanceEnvoyeeLe: new Date() } });
    envoyees++;
  }

  return NextResponse.json({ ok: true, envoyees });
}

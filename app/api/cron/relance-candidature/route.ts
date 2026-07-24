import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { envoyerNotification } from "@/lib/push/envoyer";

// Relance automatique (Pro) : 7 jours après avoir marqué un dossier « utilisé »
// (candidature envoyée), rappelle une seule fois à l'utilisateur de relancer
// le recruteur — simple rappel + lien vers un brouillon de message généré à
// la demande sur la page du dossier. Ne lit ni ne détecte aucune réponse du
// recruteur : purement un rappel, jamais une action automatique.
const DELAI_JOURS = 7;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const avant = new Date(Date.now() - DELAI_JOURS * 86400000);

  const dossiers = await prisma.dossier.findMany({
    where: {
      statut: "utilise",
      updatedAt: { lte: avant },
      relanceEnvoyeeLe: null,
      user: { plan: { in: ["pro", "pro_plus"] }, suspendu: false },
    },
    select: {
      id: true,
      userId: true,
      opportunite: { select: { intitule: true, organisme: true } },
    },
  });

  let envoyees = 0;
  for (const d of dossiers) {
    await envoyerNotification(d.userId, {
      title: "Pensez à relancer",
      body: `Toujours sans nouvelle de ${d.opportunite.organisme} ? Un message de relance vous attend.`,
      url: `/dossiers/${d.id}`,
    });
    await prisma.dossier.update({ where: { id: d.id }, data: { relanceEnvoyeeLe: new Date() } });
    envoyees++;
  }

  return NextResponse.json({ ok: true, envoyees });
}

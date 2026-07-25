import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculerScore } from "@/lib/matching/score";
import { envoyerNotification } from "@/lib/push/envoyer";

export const maxDuration = 60;

// Alertes intelligentes (Pro) : prévient un utilisateur Pro par push dès
// qu'une offre récemment publiée correspond fortement à son profil, sans
// qu'il ait besoin de repasser dans le fil. Fenêtre large (26h) car le cron
// Hobby Vercel ne tourne qu'1×/jour — mieux vaut un léger recouvrement que
// manquer une offre publiée juste après le dernier passage.
const SEUIL_SCORE = 75;
const FENETRE_HEURES = 26;
const MAX_ALERTES_PAR_UTILISATEUR = 2;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const depuis = new Date(Date.now() - FENETRE_HEURES * 3600_000);

  const utilisateurs = await prisma.user.findMany({
    where: { plan: { in: ["pro", "pro_plus"] }, suspendu: false, pushSubs: { some: {} } },
    select: {
      id: true,
      profils: {
        where: { actif: true },
        select: { formations: true, experiences: true, competences: true, langues: true, objectifs: true, nationalite: true, complete: true },
        take: 1,
      },
    },
  });

  let envoyees = 0;

  for (const u of utilisateurs) {
    const profil = u.profils[0];
    if (!profil || !profil.complete) continue;

    const offres = await prisma.opportunite.findMany({
      where: {
        actif: true,
        statut: "publiee",
        type: { not: "APPEL_PROJET" },
        updatedAt: { gte: depuis },
        interactions: { none: { userId: u.id } },
        alertesEnvoyees: { none: { userId: u.id } },
      },
      select: {
        id: true, type: true, intitule: true, organisme: true, description: true,
        conditions: true, exigenceLangue: true, piecesExigees: true,
      },
    });

    if (offres.length === 0) continue;

    const notees = offres
      .map((o) => ({ o, score: calculerScore(profil, o) }))
      .filter((x) => x.score >= SEUIL_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ALERTES_PAR_UTILISATEUR);

    for (const { o, score } of notees) {
      await envoyerNotification(u.id, {
        title: `Offre à ${score}% de correspondance`,
        body: `${o.intitule} — ${o.organisme}`,
        url: `/opportunites/${o.id}`,
      });
      await prisma.alerteEnvoyee.create({ data: { userId: u.id, opportuniteId: o.id } });
      envoyees++;
    }
  }

  return NextResponse.json({ ok: true, envoyees });
}

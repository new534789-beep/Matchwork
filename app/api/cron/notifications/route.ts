import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { envoyerNotification } from "@/lib/push/envoyer";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const maintenant = new Date();
  const dans7j = new Date(maintenant.getTime() + 7 * 86400000);
  const dans1j = new Date(maintenant.getTime() + 1 * 86400000);

  const interactions = await prisma.interaction.findMany({
    where: {
      decision: "interesse",
      opportunite: {
        dateLimite: { gte: maintenant, lte: dans7j },
        actif: true,
        statut: "publiee",
      },
    },
    include: {
      opportunite: { select: { intitule: true, organisme: true, dateLimite: true, id: true } },
    },
  });

  let envoyees = 0;
  for (const inter of interactions) {
    const dl = inter.opportunite.dateLimite;
    if (!dl) continue;
    const jours = Math.ceil((dl.getTime() - maintenant.getTime()) / 86400000);

    if (jours === 7 || jours === 3 || jours === 1) {
      await envoyerNotification(inter.userId, {
        title: jours === 1 ? "Deadline demain !" : `Deadline dans ${jours} jours`,
        body: `${inter.opportunite.intitule} — ${inter.opportunite.organisme}`,
        url: `/opportunites/${inter.opportunite.id}`,
      });
      envoyees++;
    }
  }

  return NextResponse.json({ ok: true, envoyees });
}

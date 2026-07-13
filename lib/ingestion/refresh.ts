/**
 * Re-scraping d'offres publiées dont derniereVerif > 7 jours.
 * Met à jour la description/date limite si le contenu a changé,
 * et expire les offres dont la page a disparu.
 */
import { prisma } from "@/lib/prisma";
import { recupererContenuPage } from "@/lib/ingestion/contenu-page";
import { extraireDateLimite } from "@/lib/ia/extraction-date-limite";
import { extraireOffre, iaDisponible } from "@/lib/ia/extraction-offre";

export interface RapportRefresh {
  verifiees: number;
  mises_a_jour: number;
  expirees: number;
  disparues: number;
}

export async function rafraichirOffres(limite = 10): Promise<RapportRefresh> {
  const seuil = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const aujourdhui = new Date().toISOString().slice(0, 10);

  const offres = await prisma.opportunite.findMany({
    where: {
      statut: "publiee",
      actif: true,
      derniereVerif: { lt: seuil },
    },
    orderBy: { derniereVerif: "asc" },
    take: limite,
    select: {
      id: true,
      intitule: true,
      lien: true,
      description: true,
      dateLimite: true,
    },
  });

  const rapport: RapportRefresh = { verifiees: 0, mises_a_jour: 0, expirees: 0, disparues: 0 };

  for (const offre of offres) {
    rapport.verifiees++;
    const maintenant = new Date();

    if (!offre.lien) {
      await prisma.opportunite.update({
        where: { id: offre.id },
        data: { derniereVerif: maintenant },
      });
      continue;
    }

    const contenu = await recupererContenuPage(offre.lien);

    if (!contenu) {
      await prisma.opportunite.update({
        where: { id: offre.id },
        data: { statut: "expiree", actif: false, derniereVerif: maintenant },
      });
      rapport.disparues++;
      continue;
    }

    const updates: Record<string, unknown> = { derniereVerif: maintenant };

    if (iaDisponible()) {
      const dl = await extraireDateLimite(offre.intitule, contenu, aujourdhui);
      if (dl?.dateLimite) {
        if (dl.dateLimite.getTime() < Date.now()) {
          await prisma.opportunite.update({
            where: { id: offre.id },
            data: { statut: "expiree", actif: false, derniereVerif: maintenant },
          });
          rapport.expirees++;
          continue;
        }
        if (!offre.dateLimite || dl.dateLimite.getTime() !== offre.dateLimite.getTime()) {
          updates.dateLimite = dl.dateLimite;
          updates.confianceDateLimite = dl.confiance;
          updates.sourceDateLimite = dl.source;
        }
      }

      const parsed = await extraireOffre(`${offre.intitule}\n\n${contenu}`);
      if (parsed?.description && parsed.description !== "non précisé") {
        const newDesc = parsed.description.slice(0, 2000);
        if (newDesc !== offre.description) {
          updates.description = newDesc;
        }
      }
    }

    const hasChanges = Object.keys(updates).length > 1;
    if (hasChanges) rapport.mises_a_jour++;

    await prisma.opportunite.update({
      where: { id: offre.id },
      data: updates,
    });
  }

  return rapport;
}

/**
 * Phase 2 : enrichissement IA des brouillons.
 * Prend les offres en statut "brouillon", télécharge la page,
 * fait les 2 appels IA (date limite + extraction), et met à jour.
 * Traite N offres par appel pour tenir dans 60s Vercel.
 */
import { prisma } from "@/lib/prisma";
import { recupererContenuPage } from "@/lib/ingestion/contenu-page";
import { extraireDateLimite } from "@/lib/ia/extraction-date-limite";
import { extraireOffre, iaDisponible, normaliserCanal } from "@/lib/ia/extraction-offre";

export type RapportEnrichissement = {
  traites: number;
  enrichis: number;
  rejetes: number;
  erreurs: number;
  restants: number;
  details: { id: string; intitule: string; resultat: "enrichi" | "rejete" | "erreur"; raison: string }[];
};

export async function enrichirBrouillons(limite = 3): Promise<RapportEnrichissement> {
  const brouillons = await prisma.opportunite.findMany({
    where: { statut: "brouillon" },
    orderBy: { premiereVue: "asc" },
    take: limite,
    select: {
      id: true,
      intitule: true,
      lien: true,
      type: true,
      source: true,
      langueDetectee: true,
    },
  });

  const restants = await prisma.opportunite.count({ where: { statut: "brouillon" } });

  const rapport: RapportEnrichissement = {
    traites: brouillons.length,
    enrichis: 0,
    rejetes: 0,
    erreurs: 0,
    restants: restants - brouillons.length,
    details: [],
  };

  if (!iaDisponible()) {
    rapport.erreurs = brouillons.length;
    return rapport;
  }

  const aujourdhui = new Date().toISOString().slice(0, 10);

  for (const b of brouillons) {
    try {
      if (!b.lien) {
        await prisma.opportunite.update({ where: { id: b.id }, data: { statut: "rejetee" } });
        rapport.rejetes++;
        rapport.details.push({ id: b.id, intitule: b.intitule, resultat: "rejete", raison: "Pas de lien" });
        continue;
      }

      const contenu = await recupererContenuPage(b.lien);
      if (!contenu) {
        await prisma.opportunite.update({ where: { id: b.id }, data: { statut: "rejetee" } });
        rapport.rejetes++;
        rapport.details.push({ id: b.id, intitule: b.intitule, resultat: "rejete", raison: "Page inaccessible" });
        continue;
      }

      const dl = await extraireDateLimite(b.intitule, contenu, aujourdhui);
      const dateLimite = dl?.dateLimite ?? null;
      const confiance = dl?.confiance ?? null;
      const sourceDateLimite = dl?.source ?? null;

      if (dateLimite && dateLimite.getTime() <= Date.now()) {
        await prisma.opportunite.update({ where: { id: b.id }, data: { statut: "rejetee" } });
        rapport.rejetes++;
        rapport.details.push({ id: b.id, intitule: b.intitule, resultat: "rejete", raison: "Date limite dépassée" });
        continue;
      }

      const offre = await extraireOffre(`${b.intitule}\n\n${contenu}`);
      if (!offre) {
        await prisma.opportunite.update({ where: { id: b.id }, data: { statut: "rejetee" } });
        rapport.rejetes++;
        rapport.details.push({ id: b.id, intitule: b.intitule, resultat: "rejete", raison: "Extraction IA échouée" });
        continue;
      }

      const organisme = (offre.organisme && offre.organisme !== "non précisé") ? offre.organisme.slice(0, 120) : undefined;
      const intitule = (offre.intitule && offre.intitule !== "non précisé") ? offre.intitule.slice(0, 240) : undefined;
      const description = (offre.description && offre.description !== "non précisé") ? offre.description.slice(0, 2000) : undefined;
      const conditions = (offre.conditions && offre.conditions !== "non précisé") ? offre.conditions : null;
      const piecesExigees = (Array.isArray(offre.piecesExigees) && offre.piecesExigees.length) ? JSON.stringify(offre.piecesExigees) : "[]";
      const exigenceLangue = (offre.exigenceLangue && offre.exigenceLangue !== "non précisé") ? offre.exigenceLangue : null;
      const langueDetectee = offre.langueDetectee || b.langueDetectee || "fr";
      const canalCandidature = normaliserCanal(offre.canalCandidature);
      const cibleCandidature = offre.cibleCandidature ?? null;

      const aGenerables = Array.isArray(offre.piecesExigees) && offre.piecesExigees.some((p) => p.categorie === "generable");
      const statut = (!dateLimite || !aGenerables) ? "revue_manuelle" : "a_valider";

      await prisma.opportunite.update({
        where: { id: b.id },
        data: {
          ...(organisme && { organisme }),
          ...(intitule && { intitule }),
          ...(description && { description }),
          conditions,
          piecesExigees,
          exigenceLangue,
          langueDetectee,
          canalCandidature,
          cibleCandidature,
          dateLimite,
          confianceDateLimite: confiance,
          sourceDateLimite,
          statut,
        },
      });

      rapport.enrichis++;
      rapport.details.push({
        id: b.id,
        intitule: intitule || b.intitule,
        resultat: "enrichi",
        raison: `${statut} — ${aGenerables ? "docs générables" : "pas de docs générables"}`,
      });
    } catch (e) {
      rapport.erreurs++;
      rapport.details.push({
        id: b.id,
        intitule: b.intitule,
        resultat: "erreur",
        raison: e instanceof Error ? e.message.slice(0, 100) : "Erreur inconnue",
      });
    }
  }

  return rapport;
}

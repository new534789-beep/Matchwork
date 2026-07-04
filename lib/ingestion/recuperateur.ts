import Parser from "rss-parser";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { extraireOffre, iaDisponible, normaliserCanal } from "@/lib/ia/extraction-offre";
import { extraireDateLimite } from "@/lib/ia/extraction-date-limite";
import { calculerDedupKey } from "@/lib/ingestion/dedup";
import { trierSelonDeadline } from "@/lib/ingestion/tri";
import { recupererContenuPage } from "@/lib/ingestion/contenu-page";
import { scraperUneSource } from "@/lib/ingestion/scraper";

const parser = new Parser({ timeout: 15000 });

const MAX_ITEMS_PAR_SOURCE = 15; // on ne lit que les N items les plus récents par flux
const MAX_ENRICH_PAR_PASSAGE = 40; // plafond d'appels IA par passage (coût maîtrisé)
const DESC_COURTE = 200; // sous ce nombre de caractères, on tente la page liée

export type RapportIngestion = {
  sources: number;
  sourcesEnPanne: number;
  itemsLus: number;
  creees: number;
  doublons: number;
  enrichies: number; // items pour lesquels l'IA a renvoyé une date limite
  aValider: number; // date future + fiable → file admin
  revueManuelle: number; // date absente/incertaine → file admin, signalé
  rejetees: number; // déjà closes (date passée, fiable) → écartées
  totalActives: number; // nombre TOTAL de sources actives (toutes, pas seulement ce lot)
  details: { source: string; etat: "ok" | "panne"; creees: number; erreur?: string }[];
};

/** Ancien hash sha1 (conservé pour compat avec les lignes déjà en base). */
function hashLegacy(lien?: string, titre?: string): string {
  const base = (lien?.trim() || titre?.trim() || "").toLowerCase();
  return createHash("sha1").update(base).digest("hex");
}

/** Date du jour au format YYYY-MM-DD (pour résoudre les dates relatives côté IA). */
function aujourdhuiISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Récupère → normalise → déduplique → enrichit (date limite) → trie → dépose en file.
 * Robuste : un flux en panne est marqué `panne` et n'interrompt PAS les autres.
 * AUCUNE auto-publication : rien ne passe en `publiee` sans action de l'admin.
 */
export async function ingererToutesLesSources(opts?: { skip?: number; take?: number }): Promise<RapportIngestion> {
  const totalActives = await prisma.fluxSource.count({ where: { actif: true } });
  // Lot : on traite une tranche de sources actives (ordre stable) pour éviter les timeouts.
  const sources = await prisma.fluxSource.findMany({
    where: { actif: true },
    orderBy: { createdAt: "asc" },
    skip: opts?.skip,
    take: opts?.take,
  });
  const rapport: RapportIngestion = {
    sources: sources.length, sourcesEnPanne: 0, itemsLus: 0, creees: 0, doublons: 0,
    enrichies: 0, aValider: 0, revueManuelle: 0, rejetees: 0, totalActives, details: [],
  };
  const budget = { enrich: MAX_ENRICH_PAR_PASSAGE };
  const aujourdhui = aujourdhuiISO();

  for (const source of sources) {
    // Sources de type « scrape » (sites sans flux) : moteur de scraping dédié,
    // même pipeline d'extraction/triage, même file de validation.
    if (source.type === "scrape") {
      await scraperUneSource(source, { rapport, budget, aujourdhui });
      continue;
    }

    let creeesSource = 0;
    try {
      const flux = await parser.parseURL(source.url);
      const items = (flux.items ?? []).slice(0, MAX_ITEMS_PAR_SOURCE);
      rapport.itemsLus += items.length;
      const titreFlux = flux.title?.toString().slice(0, 120) || source.nom;

      for (const item of items) {
        const lien = item.link ?? undefined;
        const titre = item.title ?? undefined;
        if (!titre && !lien) continue;

        // ─── Clé de dédup canonique (guid → url → hash) ────────────────────────
        const guid = (item.guid ?? (item as { id?: string }).id ?? undefined)?.toString();
        const dedupKey = calculerDedupKey(guid, lien, titre);
        const maintenant = new Date();

        // Date du flux (item.isoDate) — AFFICHAGE seulement, pas la validité.
        const dateFlux = item.isoDate ? new Date(item.isoDate) : null;
        const datePublication = dateFlux && !isNaN(dateFlux.getTime()) ? dateFlux : null;

        // ─── Upsert : si la ligne EXISTE, on ne touche PAS first_seen_at ───────
        const existe = await prisma.opportunite.findUnique({
          where: { dedupKey },
          select: { id: true, datePublication: true },
        });
        if (existe) {
          rapport.doublons++;
          // On met juste à jour la date du flux (si utile) + le dernier passage.
          await prisma.opportunite.update({
            where: { id: existe.id },
            data: {
              datePublication: datePublication ?? existe.datePublication,
              derniereVerif: maintenant,
            },
          }).catch(() => {});
          continue;
        }

        // ─── Données de base issues du flux (jamais inventées) ─────────────────
        const descFlux = (item.contentSnippet || item.content || "").toString().replace(/\s+/g, " ").trim().slice(0, 2000);
        let organisme = titreFlux;
        let intitule = (titre ?? "Sans titre").slice(0, 240);
        let descFinale = descFlux || "Non précisé";
        let conditions: string | null = null;
        let piecesExigees = "[]";
        let exigenceLangue: string | null = null;
        let langueDetectee = "fr";
        let canalCandidature: string | null = null;
        let cibleCandidature: string | null = null;

        // ─── Enrichissement IA : EXTRACTION DE LA DATE LIMITE ──────────────────
        let dateLimite: Date | null = null;
        let confiance: number | null = null;
        let sourceDateLimite: string | null = null;

        if (iaDisponible() && budget.enrich > 0) {
          budget.enrich--;
          // 1er passage : titre + description du flux + date du jour (pas de fetch).
          let dl = await extraireDateLimite(titre ?? "", descFlux, aujourdhui);

          // Fetch CONDITIONNEL : description trop courte ET aucune date trouvée →
          // on récupère UNE fois le texte de la page liée, puis on relance.
          if (lien && (!dl || !dl.dateLimite) && descFlux.length < DESC_COURTE && budget.enrich > 0) {
            const contenu = await recupererContenuPage(lien);
            if (contenu) {
              budget.enrich--;
              dl = await extraireDateLimite(titre ?? "", contenu, aujourdhui);
              // La page est déjà récupérée : on réutilise l'extraction riche
              // existante pour améliorer le contenu affiché (sans fetch en plus).
              if (budget.enrich > 0) {
                budget.enrich--;
                const offre = await extraireOffre(`${titre ?? ""}\n\n${contenu}`);
                if (offre) {
                  if (offre.organisme && offre.organisme !== "non précisé") organisme = offre.organisme.slice(0, 120);
                  if (offre.intitule && offre.intitule !== "non précisé") intitule = offre.intitule.slice(0, 240);
                  if (offre.description && offre.description !== "non précisé") descFinale = offre.description.slice(0, 2000);
                  if (offre.conditions && offre.conditions !== "non précisé") conditions = offre.conditions;
                  if (Array.isArray(offre.piecesExigees) && offre.piecesExigees.length) piecesExigees = JSON.stringify(offre.piecesExigees);
                  if (offre.exigenceLangue && offre.exigenceLangue !== "non précisé") exigenceLangue = offre.exigenceLangue;
                  if (offre.langueDetectee) langueDetectee = offre.langueDetectee;
                  canalCandidature = normaliserCanal(offre.canalCandidature);
                  cibleCandidature = offre.cibleCandidature ?? null;
                }
              }
            }
          }

          if (dl) {
            dateLimite = dl.dateLimite;
            confiance = dl.confiance;
            sourceDateLimite = dl.source;
            if (dl.dateLimite) rapport.enrichies++;
          }
        }

        // ─── Tri par validité (jamais de publication automatique) ──────────────
        const statut = trierSelonDeadline(dateLimite, confiance, maintenant);

        try {
          await prisma.opportunite.create({
            data: {
              type: source.categorie || "BOURSE",
              source: "RSS",
              fluxSourceId: source.id,
              organisme,
              intitule,
              description: descFinale,
              conditions,
              piecesExigees,
              exigenceLangue,
              langueDetectee,
              canalCandidature,
              cibleCandidature,
              dateLimite,
              confianceDateLimite: confiance,
              sourceDateLimite,
              lien: lien ?? null,
              sourceUrl: lien ?? null,
              dedupKey,
              hash: hashLegacy(lien, titre), // compat ancienne dédup
              datePublication,
              premiereVue: maintenant, // first_seen_at : fixé une seule fois
              derniereVerif: maintenant,
              statut,
              actif: false, // jamais visible dans le fil sans validation admin
            },
          });
          creeesSource++;
          rapport.creees++;
          if (statut === "a_valider") rapport.aValider++;
          else if (statut === "revue_manuelle") rapport.revueManuelle++;
          else rapport.rejetees++;
        } catch {
          // Collision de clé (course / doublon entre flux) → ignoré silencieusement.
          rapport.doublons++;
        }
      }

      await prisma.fluxSource.update({ where: { id: source.id }, data: { etat: "ok", dernierFetch: new Date(), message: null } });
      rapport.details.push({ source: source.nom, etat: "ok", creees: creeesSource });
    } catch (e) {
      rapport.sourcesEnPanne++;
      const msg = e instanceof Error ? e.message.slice(0, 200) : "Erreur inconnue";
      await prisma.fluxSource
        .update({ where: { id: source.id }, data: { etat: "panne", dernierFetch: new Date(), message: msg } })
        .catch(() => {});
      rapport.details.push({ source: source.nom, etat: "panne", creees: creeesSource, erreur: msg });
    }
  }

  return rapport;
}

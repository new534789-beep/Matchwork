import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { calculerDedupKey } from "@/lib/ingestion/dedup";

import type RssParser from "rss-parser";
let _parser: RssParser | null = null;
async function getParser() {
  if (!_parser) {
    const Parser = (await import("rss-parser")).default;
    _parser = new Parser({ timeout: 8000 });
  }
  return _parser;
}

const MAX_ITEMS_PAR_SOURCE = 200;
const MAX_ENRICH_PAR_PASSAGE = 700;

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
      const { scraperUneSource } = await import("@/lib/ingestion/scraper");
      await scraperUneSource(source, { rapport, budget, aujourdhui });
      continue;
    }

    let creeesSource = 0;
    try {
      const parser = await getParser();
      const flux = await parser.parseURL(source.url);
      const items = (flux.items ?? []).slice(0, MAX_ITEMS_PAR_SOURCE);
      rapport.itemsLus += items.length;
      const titreFlux = flux.title?.toString().slice(0, 120) || source.nom;

      const maintenant = new Date();
      const batch: Array<Record<string, unknown>> = [];

      for (const item of items) {
        const lien = item.link ?? undefined;
        const titre = item.title ?? undefined;
        if (!titre && !lien) continue;

        const guid = (item.guid ?? (item as { id?: string }).id ?? undefined)?.toString();
        const dedupKey = calculerDedupKey(guid, lien, titre);
        const dateFlux = item.isoDate ? new Date(item.isoDate) : null;
        const datePublication = dateFlux && !isNaN(dateFlux.getTime()) ? dateFlux : null;
        const descFlux = (item.contentSnippet || item.content || "").toString().replace(/\s+/g, " ").trim().slice(0, 2000);

        batch.push({
          type: source.categorie || "BOURSE",
          source: "RSS",
          fluxSourceId: source.id,
          organisme: titreFlux,
          intitule: (titre ?? "Sans titre").slice(0, 240),
          description: descFlux || "En attente de vérification IA",
          lien: lien ?? null,
          sourceUrl: lien ?? null,
          dedupKey,
          hash: hashLegacy(lien, titre),
          datePublication,
          premiereVue: maintenant,
          derniereVerif: maintenant,
          statut: "brouillon",
          actif: false,
        });
      }

      const result = await prisma.opportunite.createMany({ data: batch as any, skipDuplicates: true });
      creeesSource = result.count;
      rapport.creees += result.count;
      rapport.doublons += batch.length - result.count;

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

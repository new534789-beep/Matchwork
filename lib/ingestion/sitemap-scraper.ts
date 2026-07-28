import { createHash } from "crypto";
import type { FluxSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculerDedupKey } from "@/lib/ingestion/dedup";
import type { RapportIngestion } from "@/lib/ingestion/recuperateur";

const MAX_URLS = 30;

/**
 * Motif de chemin identifiant les bourses dans le sitemap, par organisme
 * (ex. Setondji préfixe ses opportunités de bourse par "b_"). À étendre si
 * d'autres sources sitemap sont ajoutées avec une convention différente.
 */
const FILTRE_PAR_ORGANISME: Record<string, RegExp> = {
  setondji: /\/opportunites\/b_/i,
};

function hashLegacy(lien?: string, titre?: string): string {
  return createHash("sha1").update((lien?.trim() || titre?.trim() || "").toLowerCase()).digest("hex");
}

/** "b_bourse-mastercard-uac-benin-2026" → "Bourse Mastercard Uac Benin 2026" */
function titreDepuisSlug(url: string): string {
  const slug = url.replace(/\/+$/, "").split("/").pop() || "";
  const sansPrefixe = slug.replace(/^[a-z]_/, "");
  return sansPrefixe
    .split("-")
    .filter(Boolean)
    .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1))
    .join(" ")
    .slice(0, 240) || "Sans titre";
}

async function recupererSitemap(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "MatchworkBot/1.0 (+https://matchwork.app)" },
      redirect: "follow",
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    clearTimeout(t);
    return null;
  }
}

export async function ingererDepuisSitemap(
  source: FluxSource,
  ctx: { rapport: RapportIngestion; aujourdhui: string }
): Promise<void> {
  const { rapport } = ctx;
  let creeesSource = 0;
  try {
    const xml = await recupererSitemap(source.url);
    if (!xml) throw new Error("Sitemap inaccessible");

    const toutesLesUrls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
    const filtre = FILTRE_PAR_ORGANISME[source.nom.toLowerCase()];
    const urls = (filtre ? toutesLesUrls.filter((u) => filtre.test(u)) : toutesLesUrls).slice(0, MAX_URLS);
    rapport.itemsLus += urls.length;

    const maintenant = new Date();
    const batch: Array<Record<string, unknown>> = [];

    for (const lien of urls) {
      const titre = titreDepuisSlug(lien);
      const dedupKey = calculerDedupKey(undefined, lien, titre);

      batch.push({
        type: source.categorie || "BOURSE",
        source: "SITEMAP",
        fluxSourceId: source.id,
        organisme: source.nom,
        intitule: titre,
        description: "En attente de vérification IA",
        lien,
        sourceUrl: lien,
        dedupKey,
        hash: hashLegacy(lien, titre),
        datePublication: null,
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

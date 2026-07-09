/**
 * Module partagé pour le scraping de portails (bourses, stages, formations, admissions).
 * Extrait de scholarship-scraper.ts pour éviter la duplication.
 */
import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { calculerDedupKey, canoniserUrl } from "@/lib/ingestion/dedup";
import { recupererContenuPage } from "@/lib/ingestion/contenu-page";
import { urlAutorisee } from "@/lib/ingestion/robots";
import { extraireDateLimite } from "@/lib/ia/extraction-date-limite";
import { extraireOffre, iaDisponible, normaliserCanal } from "@/lib/ia/extraction-offre";

// ── Configuration par défaut ────────────────────────────────────────────────

const DEFAULT_MAX_LIENS = 12;
const DEFAULT_PAUSE_MS = 400;
const DEFAULT_MAX_ENRICH = 60;

export const CHEMINS_IGNORES = [
  "/category/", "/categorie/", "/tag/", "/author/", "/auteur/", "/page/",
  "/feed", "/wp-login", "/wp-admin", "/about", "/a-propos", "/contact",
  "/privacy", "/confidentialite", "/terms", "/mentions", "/login", "/register",
  "/search", "/recherche", "/cart", "/panier", "/subscribe", "/newsletter",
];

export const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Types ───────────────────────────────────────────────────────────────────

export interface BasePortalSource {
  name: string;
  country: string;
  url: string;
  identifier: string;
  language: "en" | "fr" | "de" | "zh" | "ko" | "nl" | "ja";
  selectors?: {
    listItem?: string;
    link?: string;
    title?: string;
  };
}

export type RapportPortail = {
  sources: number;
  offresLues: number;
  creees: number;
  doublons: number;
  erreurs: number;
  details: { source: string; pays: string; offres: number; erreur?: string }[];
};

export interface PortalScraperConfig {
  type: string;
  sourcePrefix: string;
  maxLiens?: number;
  maxEnrich?: number;
  pauseMs?: number;
}

// ── Normalisation des dates locales ─────────────────────────────────────────

const MOIS_ALLEMANDS: Record<string, string> = {
  januar: "January", februar: "February", "märz": "March", april: "April",
  mai: "May", juni: "June", juli: "July", august: "August",
  september: "September", oktober: "October", november: "November", dezember: "December",
};

export function normaliserDatesLocales(texte: string, langue: string): string {
  if (langue === "de") {
    return texte.replace(
      /(\d{1,2})\.\s*(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+(\d{4})/gi,
      (_, jour, mois, annee) => `${jour} ${MOIS_ALLEMANDS[mois.toLowerCase()] ?? mois} ${annee}`,
    );
  }
  if (langue === "zh") {
    return texte.replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/g, "$1-$2-$3");
  }
  if (langue === "ko") {
    return texte.replace(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g, "$1-$2-$3");
  }
  return texte;
}

// ── Fetch HTML ──────────────────────────────────────────────────────────────

export async function recupererHtml(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "MatchworkBot/1.0 (+https://matchwork.app)" },
      redirect: "follow",
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html")) return null;
    return await res.text();
  } catch {
    clearTimeout(t);
    return null;
  }
}

// ── Extraction de liens ─────────────────────────────────────────────────────

export function extraireLiens(
  html: string,
  baseUrl: string,
  maxLiens: number,
  selectors?: BasePortalSource["selectors"],
): { lien: string; titre: string }[] {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const vus = new Set<string>();
  const out: { lien: string; titre: string }[] = [];

  if (selectors?.listItem) {
    $(selectors.listItem).each((_, el) => {
      const linkEl = selectors.link ? $(el).find(selectors.link) : $(el).find("a[href]").first();
      const href = (linkEl.attr("href") || "").trim();
      if (!href) return;
      let u: URL;
      try { u = new URL(href, baseUrl); } catch { return; }
      const canon = canoniserUrl(u.toString());
      if (!canon || vus.has(canon)) return;
      vus.add(canon);
      const titre = selectors.title
        ? $(el).find(selectors.title).text().replace(/\s+/g, " ").trim()
        : linkEl.text().replace(/\s+/g, " ").trim();
      out.push({ lien: u.toString(), titre: titre.slice(0, 240) });
    });
    return out.slice(0, maxLiens);
  }

  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;

    let u: URL;
    try { u = new URL(href, baseUrl); } catch { return; }
    if (u.protocol !== "http:" && u.protocol !== "https:") return;
    if (u.host !== base.host) return;

    const chemin = u.pathname.toLowerCase();
    if (chemin === "/" || chemin === "") return;
    if (CHEMINS_IGNORES.some((c) => chemin.includes(c))) return;

    const slug = chemin.replace(/\/+$/, "").split("/").pop() || "";
    const ressembleArticle = slug.length >= 8 && (slug.includes("-") || /\d/.test(slug));
    if (!ressembleArticle) return;

    const canon = canoniserUrl(u.toString());
    if (!canon || vus.has(canon)) return;
    vus.add(canon);
    out.push({ lien: u.toString(), titre: $(el).text().replace(/\s+/g, " ").trim().slice(0, 240) });
  });

  return out.slice(0, maxLiens);
}

// ── Hash legacy ─────────────────────────────────────────────────────────────

export function hashLegacy(lien?: string, titre?: string): string {
  return createHash("sha1").update((lien?.trim() || titre?.trim() || "").toLowerCase()).digest("hex");
}

// ── Pipeline générique ──────────────────────────────────────────────────────

export async function scraperPortails<S extends BasePortalSource>(
  sources: S[],
  config: PortalScraperConfig,
): Promise<RapportPortail> {
  const maxLiens = config.maxLiens ?? DEFAULT_MAX_LIENS;
  const pauseMs = config.pauseMs ?? DEFAULT_PAUSE_MS;
  const maxEnrich = config.maxEnrich ?? DEFAULT_MAX_ENRICH;

  const rapport: RapportPortail = {
    sources: sources.length,
    offresLues: 0,
    creees: 0,
    doublons: 0,
    erreurs: 0,
    details: [],
  };

  const aujourdhui = new Date().toISOString().slice(0, 10);
  let budgetEnrich = maxEnrich;

  for (const source of sources) {
    try {
      if (!(await urlAutorisee(source.url))) {
        rapport.erreurs++;
        rapport.details.push({ source: source.name, pays: source.country, offres: 0, erreur: "Interdit par robots.txt" });
        continue;
      }

      const html = await recupererHtml(source.url);
      if (!html) {
        rapport.erreurs++;
        rapport.details.push({ source: source.name, pays: source.country, offres: 0, erreur: "Page inaccessible ou non-HTML" });
        continue;
      }

      const liens = extraireLiens(html, source.url, maxLiens, source.selectors);
      rapport.offresLues += liens.length;

      for (const { lien, titre } of liens) {
        const maintenant = new Date();
        const dedupKey = calculerDedupKey(undefined, lien, titre);

        const existe = await prisma.opportunite.findUnique({ where: { dedupKey }, select: { id: true } });
        if (existe) {
          rapport.doublons++;
          await prisma.opportunite.update({ where: { id: existe.id }, data: { derniereVerif: maintenant } }).catch(() => {});
          continue;
        }

        if (!(await urlAutorisee(lien))) continue;

        const contenuBrut = await recupererContenuPage(lien);
        await dormir(pauseMs);
        if (!contenuBrut) continue;

        const contenu = normaliserDatesLocales(contenuBrut, source.language);

        if (!iaDisponible() || budgetEnrich < 2) continue;

        budgetEnrich--;
        const dl = await extraireDateLimite(titre || "Sans titre", contenu, aujourdhui);
        const dateLimite = dl?.dateLimite ?? null;
        const confiance = dl?.confiance ?? null;
        const sourceDateLimite = dl?.source ?? null;

        const dateLimitePassee = dateLimite && dateLimite.getTime() <= maintenant.getTime();
        if (dateLimitePassee) continue;

        const sansDateLimite = !dateLimite;

        budgetEnrich--;
        const offre = await extraireOffre(`${titre || ""}\n\n${contenu}`);
        if (!offre) continue;

        let organisme = source.name;
        let intitule = (titre || "Sans titre").slice(0, 240);
        let descFinale = "Non précisé";
        let conditions: string | null = null;
        let piecesExigees = "[]";
        let exigenceLangue: string | null = null;
        let langueDetectee: string = source.language;
        let canalCandidature: string | null = null;
        let cibleCandidature: string | null = null;

        if (offre.organisme && offre.organisme !== "non précisé") organisme = offre.organisme.slice(0, 120);
        if (offre.intitule && offre.intitule !== "non précisé") intitule = offre.intitule.slice(0, 240);
        if (offre.description && offre.description !== "non précisé") descFinale = offre.description.slice(0, 2000);
        if (offre.conditions && offre.conditions !== "non précisé") conditions = offre.conditions;
        if (Array.isArray(offre.piecesExigees) && offre.piecesExigees.length) piecesExigees = JSON.stringify(offre.piecesExigees);
        if (offre.exigenceLangue && offre.exigenceLangue !== "non précisé") exigenceLangue = offre.exigenceLangue;
        if (offre.langueDetectee) langueDetectee = offre.langueDetectee;
        canalCandidature = normaliserCanal(offre.canalCandidature);
        cibleCandidature = offre.cibleCandidature ?? null;

        const aGenerables = Array.isArray(offre.piecesExigees) && offre.piecesExigees.some((p) => p.categorie === "generable");

        let statut: string;
        if (sansDateLimite || !aGenerables) {
          statut = "revue_manuelle";
        } else {
          statut = "a_valider";
        }

        try {
          await prisma.opportunite.create({
            data: {
              type: config.type,
              source: `${config.sourcePrefix}:${source.identifier}`,
              organisme, intitule, description: descFinale, conditions, piecesExigees,
              exigenceLangue, langueDetectee, canalCandidature, cibleCandidature,
              dateLimite, confianceDateLimite: confiance, sourceDateLimite,
              lien, sourceUrl: lien, dedupKey, hash: hashLegacy(lien, titre),
              datePublication: null, premiereVue: maintenant, derniereVerif: maintenant,
              statut, actif: false,
            },
          });
          rapport.creees++;
        } catch {
          rapport.doublons++;
        }
      }

      rapport.details.push({ source: source.name, pays: source.country, offres: liens.length });
    } catch (e) {
      rapport.erreurs++;
      rapport.details.push({
        source: source.name, pays: source.country, offres: 0,
        erreur: e instanceof Error ? e.message.slice(0, 200) : "Erreur inconnue",
      });
    }

    await dormir(200);
  }

  return rapport;
}

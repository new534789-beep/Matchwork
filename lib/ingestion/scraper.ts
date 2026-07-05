import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import type { FluxSource } from "@prisma/client";
import { extraireOffre, iaDisponible, normaliserCanal } from "@/lib/ia/extraction-offre";
import { extraireDateLimite } from "@/lib/ia/extraction-date-limite";
import { calculerDedupKey, canoniserUrl } from "@/lib/ingestion/dedup";
import { recupererContenuPage } from "@/lib/ingestion/contenu-page";
import { urlAutorisee } from "@/lib/ingestion/robots";
import { traduireOffreFr } from "@/lib/ia/traduction";
import type { RapportIngestion } from "@/lib/ingestion/recuperateur";

const MAX_LIENS = 12; // articles examinés par page liste et par passage
const PAUSE_MS = 700; // politesse entre deux pages d'un même site

// Chemins typiques de navigation/admin à ignorer (pas des annonces).
const CHEMINS_IGNORES = [
  "/category/", "/categorie/", "/tag/", "/author/", "/auteur/", "/page/",
  "/feed", "/wp-login", "/wp-admin", "/about", "/a-propos", "/contact",
  "/privacy", "/confidentialite", "/terms", "/mentions", "/login", "/register",
  "/search", "/recherche", "/cart", "/panier", "/subscribe", "/newsletter",
];

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

function hashLegacy(lien?: string, titre?: string): string {
  return createHash("sha1").update((lien?.trim() || titre?.trim() || "").toLowerCase()).digest("hex");
}

async function recupererHtml(url: string): Promise<string | null> {
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

/** Extrait les liens d'annonces probables d'une page liste (même domaine + heuristique de slug). */
function extraireLiens(html: string, baseUrl: string): { lien: string; titre: string }[] {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const vus = new Set<string>();
  const out: { lien: string; titre: string }[] = [];

  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;

    let u: URL;
    try {
      u = new URL(href, baseUrl);
    } catch {
      return;
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") return;
    if (u.host !== base.host) return; // même site uniquement

    const chemin = u.pathname.toLowerCase();
    if (chemin === "/" || chemin === "") return;
    if (CHEMINS_IGNORES.some((c) => chemin.includes(c))) return;

    // Heuristique : une annonce a généralement un slug descriptif (tirets ou chiffres).
    const slug = chemin.replace(/\/+$/, "").split("/").pop() || "";
    const ressembleArticle = slug.length >= 8 && (slug.includes("-") || /\d/.test(slug));
    if (!ressembleArticle) return;

    const canon = canoniserUrl(u.toString());
    if (!canon || vus.has(canon)) return;
    vus.add(canon);
    out.push({ lien: u.toString(), titre: $(el).text().replace(/\s+/g, " ").trim().slice(0, 240) });
  });

  return out.slice(0, MAX_LIENS);
}

/**
 * Scrape UNE source (type `scrape`) : page liste → liens d'annonces → pour chaque
 * lien NOUVEAU, récupère la page et passe par le moteur d'extraction IA existant.
 * Même triage que le RSS (a_valider / revue_manuelle / rejetee) — JAMAIS publié auto.
 * Met à jour l'état de la source et le rapport. Robuste : isolé en try/catch par l'appelant.
 */
export async function scraperUneSource(
  source: FluxSource,
  ctx: { rapport: RapportIngestion; budget: { enrich: number }; aujourdhui: string },
): Promise<void> {
  const { rapport, budget, aujourdhui } = ctx;
  let creeesSource = 0;

  try {
    if (!(await urlAutorisee(source.url))) {
      throw new Error("Interdit par robots.txt");
    }

    const html = await recupererHtml(source.url);
    if (!html) throw new Error("Page liste inaccessible ou non-HTML");

    const liens = extraireLiens(html, source.url);
    rapport.itemsLus += liens.length;

    for (const { lien, titre } of liens) {
      const maintenant = new Date();
      const dedupKey = calculerDedupKey(undefined, lien, titre);

      const existe = await prisma.opportunite.findUnique({ where: { dedupKey }, select: { id: true } });
      if (existe) {
        rapport.doublons++;
        continue;
      }

      // robots.txt sur la page de détail aussi.
      if (!(await urlAutorisee(lien))) continue;

      const contenu = await recupererContenuPage(lien);
      await dormir(PAUSE_MS); // politesse
      if (!contenu) continue; // page inaccessible → on ne crée rien (pas d'invention)

      // ── IA OBLIGATOIRE : pas d'IA = pas d'insertion ──
      if (!iaDisponible() || budget.enrich < 2) continue;

      budget.enrich--;
      const dl = await extraireDateLimite(titre || "Sans titre", contenu, aujourdhui);
      const dateLimite = dl?.dateLimite ?? null;
      const confiance = dl?.confiance ?? null;
      const sourceDateLimite = dl?.source ?? null;

      if (!dateLimite || dateLimite.getTime() <= maintenant.getTime()) {
        rapport.rejetees++;
        continue;
      }
      rapport.enrichies++;

      // Extraction complète IA obligatoire
      budget.enrich--;
      const offre = await extraireOffre(`${titre || ""}\n\n${contenu}`);
      if (!offre) continue; // extraction échouée → on n'insère pas

      let organisme = source.nom;
      let intitule = (titre || "Sans titre").slice(0, 240);
      let descFinale = "Non précisé";
      let conditions: string | null = null;
      let piecesExigees = "[]";
      let exigenceLangue: string | null = null;
      let langueDetectee = "fr";
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

      // Pas de pièces generables = pas d'intérêt pour Matchwork
      const aGenerables = Array.isArray(offre.piecesExigees) && offre.piecesExigees.some((p) => p.categorie === "generable");
      if (!aGenerables) { rapport.rejetees++; continue; }

      // Traduction FR pour l'affichage (si l'offre n'est pas en français).
      if (langueDetectee && langueDetectee !== "fr" && budget.enrich > 0) {
        budget.enrich--;
        const tr = await traduireOffreFr({ intitule, description: descFinale, conditions });
        if (tr) { intitule = tr.intitule; descFinale = tr.description; conditions = tr.conditions; }
      }

      try {
        await prisma.opportunite.create({
          data: {
            type: source.categorie || "BOURSE",
            source: "SCRAPE",
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
            lien,
            sourceUrl: lien,
            dedupKey,
            hash: hashLegacy(lien, titre),
            datePublication: null,
            premiereVue: maintenant,
            derniereVerif: maintenant,
            statut: "a_valider", // date future contrôlée → directement dans la file
            actif: false, // jamais visible sans validation admin
          },
        });
        creeesSource++;
        rapport.creees++;
        rapport.aValider++;
      } catch {
        rapport.doublons++; // collision de clé → doublon
      }
    }

    await prisma.fluxSource.update({ where: { id: source.id }, data: { etat: "ok", dernierFetch: new Date(), message: null } });
    rapport.details.push({ source: source.nom, etat: "ok", creees: creeesSource });
  } catch (e) {
    rapport.sourcesEnPanne++;
    const msg = e instanceof Error ? e.message.slice(0, 200) : "Erreur inconnue";
    await prisma.fluxSource.update({ where: { id: source.id }, data: { etat: "panne", dernierFetch: new Date(), message: msg } }).catch(() => {});
    rapport.details.push({ source: source.nom, etat: "panne", creees: creeesSource, erreur: msg });
  }
}

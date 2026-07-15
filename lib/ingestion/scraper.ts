import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import type { FluxSource } from "@prisma/client";
import { calculerDedupKey, canoniserUrl } from "@/lib/ingestion/dedup";
import { urlAutorisee } from "@/lib/ingestion/robots";
import type { RapportIngestion } from "@/lib/ingestion/recuperateur";

const MAX_LIENS = 12;

// Chemins typiques de navigation/admin à ignorer (pas des annonces).
const CHEMINS_IGNORES = [
  "/category/", "/categorie/", "/tag/", "/author/", "/auteur/", "/page/",
  "/feed", "/wp-login", "/wp-admin", "/about", "/a-propos", "/contact",
  "/privacy", "/confidentialite", "/terms", "/mentions", "/login", "/register",
  "/search", "/recherche", "/cart", "/panier", "/subscribe", "/newsletter",
  "/espace-candidat", "/espace-employeur", "/actualite", "/connexion", "/inscription",
  "/offres-par-fonction", "/offres-par-secteur", "/conseils",
];

// Intitulés génériques de menu/navigation vus dans le texte des liens — jamais
// le titre d'une annonce individuelle, même si l'URL ressemble à un slug d'article.
const INTITULES_GENERIQUES = [
  /^détail$/i, /^detail$/i, /^voir\s*plus$/i, /^en savoir plus$/i, /^lire la suite$/i,
  /^offres?\s+d'emplois?/i, /^offre\s+d\s?emploi/i, /^chercher un emploi$/i,
  /^recherche(r)?\s+un\s+emploi$/i, /^espace\s+candidat/i, /^espace\s+employeur/i,
  /^connexion$/i, /^inscription$/i, /^accueil$/i, /^contact$/i, /^à propos$/i,
];

/** Un intitulé de lien trop court ou générique n'est pas une annonce individuelle. */
function titreGenerique(titre: string): boolean {
  const t = titre.trim();
  // Un vrai intitulé de poste peut être court ("Chauffeur", "AI Engineer") : on ne
  // filtre sur la longueur seule qu'en dessous d'un seuil très bas (icône/lien vide).
  if (t.length < 4) return true;
  return INTITULES_GENERIQUES.some((re) => re.test(t));
}


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

    const titre = $(el).text().replace(/\s+/g, " ").trim().slice(0, 240);
    // Le texte du lien est générique (menu, bouton "Détail"...) : ce n'est pas une
    // annonce individuelle même si l'URL ressemble à un slug d'article.
    if (titreGenerique(titre)) return;

    const canon = canoniserUrl(u.toString());
    if (!canon || vus.has(canon)) return;
    vus.add(canon);
    out.push({ lien: u.toString(), titre });
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

    const maintenant = new Date();
    const batch = liens.map(({ lien, titre }) => ({
      type: source.categorie || "BOURSE",
      source: "SCRAPE",
      fluxSourceId: source.id,
      organisme: source.nom,
      intitule: (titre || "Sans titre").slice(0, 240),
      description: "En attente de vérification IA",
      lien,
      sourceUrl: lien,
      dedupKey: calculerDedupKey(undefined, lien, titre, source.nom),
      hash: hashLegacy(lien, titre),
      datePublication: null,
      premiereVue: maintenant,
      derniereVerif: maintenant,
      statut: "brouillon",
      actif: false,
    }));

    const result = await prisma.opportunite.createMany({ data: batch as any, skipDuplicates: true });
    creeesSource = result.count;
    rapport.creees += result.count;
    rapport.doublons += batch.length - result.count;

    await prisma.fluxSource.update({ where: { id: source.id }, data: { etat: "ok", dernierFetch: new Date(), message: null } });
    rapport.details.push({ source: source.nom, etat: "ok", creees: creeesSource });
  } catch (e) {
    rapport.sourcesEnPanne++;
    const msg = e instanceof Error ? e.message.slice(0, 200) : "Erreur inconnue";
    await prisma.fluxSource.update({ where: { id: source.id }, data: { etat: "panne", dernierFetch: new Date(), message: msg } }).catch(() => {});
    rapport.details.push({ source: source.nom, etat: "panne", creees: creeesSource, erreur: msg });
  }
}

import { createHash } from "crypto";

/**
 * Paramètres de tracking à retirer de l'URL avant comparaison : ils changent
 * d'un partage à l'autre sans changer la page réelle (campagnes, réseaux sociaux…).
 */
const PARAMS_TRACKING = new Set(["fbclid", "gclid", "mc_cid", "mc_eid", "igshid", "ref"]);

/**
 * Canonise une URL pour la dédup :
 *  - host en minuscules
 *  - retire le fragment (#…)
 *  - retire les paramètres de tracking (utm_*, fbclid, gclid, mc_cid, mc_eid, igshid, ref)
 *  - garde le reste du chemin / des paramètres
 *  - enlève le « / » final
 * Renvoie null si l'URL est invalide.
 */
export function canoniserUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    // Retrait des paramètres de tracking (on collecte les clés d'abord pour
    // ne pas muter la collection pendant l'itération).
    for (const cle of [...u.searchParams.keys()]) {
      const c = cle.toLowerCase();
      if (c.startsWith("utm_") || PARAMS_TRACKING.has(c)) u.searchParams.delete(cle);
    }
    const host = u.host.toLowerCase();
    const chemin = u.pathname.replace(/\/+$/, ""); // enlève le(s) « / » final(aux)
    const qs = u.searchParams.toString();
    // Fragment ignoré volontairement (validité indépendante de l'ancre).
    return `${u.protocol}//${host}${chemin}${qs ? `?${qs}` : ""}`;
  } catch {
    return null;
  }
}

/** Normalise un titre pour le hash de repli : minuscules, espaces compactés. */
function normaliserTitre(titre: string): string {
  return titre.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Calcule la clé de déduplication d'un item de flux, dans l'ordre :
 *   1. guid/id présent et non vide  → "guid:" + sa valeur
 *   2. sinon, lien présent          → "url:"  + URL canonique
 *   3. sinon (repli)                → "hash:" + sha256(titre normalisé + "|" + lien)
 *
 * Stable : pour un même item, la clé ne change pas d'un passage à l'autre.
 */
export function calculerDedupKey(
  guid: string | undefined,
  lien: string | undefined,
  titre: string | undefined,
): string {
  const g = (guid ?? "").trim();
  if (g) return `guid:${g}`;

  if (lien) {
    const canon = canoniserUrl(lien);
    if (canon) return `url:${canon}`;
  }

  const base = `${normaliserTitre(titre ?? "")}|${lien ?? ""}`;
  return `hash:${createHash("sha256").update(base).digest("hex")}`;
}

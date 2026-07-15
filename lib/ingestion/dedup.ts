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
 * Détecte les URLs générées de façon non déterministe à chaque rendu de page —
 * p. ex. les routes à liaison de modèle chiffrée de Laravel (`Crypt::encryptString`),
 * dont le dernier segment de chemin est un JSON base64 {iv,value,mac}. L'IV étant
 * tiré au hasard à CHAQUE chiffrement, cette URL change même pour une même offre
 * revisitée à quelques secondes d'intervalle (vu sur jobbenin.com : /offres/<jeton>,
 * jeton différent à chaque chargement, y compris deux fois sur la même page).
 * Une telle URL est inutilisable comme identifiant de dédup.
 */
function estUrlNonIdentifiante(url: string): boolean {
  try {
    const segment = new URL(url).pathname.replace(/\/+$/, "").split("/").pop() || "";
    if (segment.length < 20) return false;
    const b64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    return (
      typeof payload === "object" && payload !== null &&
      typeof payload.iv === "string" && typeof payload.value === "string" && typeof payload.mac === "string"
    );
  } catch {
    return false;
  }
}

/**
 * Calcule la clé de déduplication d'un item de flux, dans l'ordre :
 *   1. guid/id présent et non vide          → "guid:" + sa valeur
 *   2. sinon, lien présent mais non fiable   → "hash:" + sha256(organisme + "|" + titre) — voir estUrlNonIdentifiante
 *   3. sinon, lien présent                   → "url:"  + URL canonique
 *   4. sinon (repli)                         → "hash:" + sha256(titre normalisé + "|" + lien)
 *
 * Stable : pour un même item, la clé ne change pas d'un passage à l'autre
 * (sauf cas 2, où c'est justement le lien qui ne l'est pas).
 */
export function calculerDedupKey(
  guid: string | undefined,
  lien: string | undefined,
  titre: string | undefined,
  organisme?: string,
): string {
  const g = (guid ?? "").trim();
  if (g) return `guid:${g}`;

  if (lien) {
    if (estUrlNonIdentifiante(lien)) {
      const base = `${normaliserTitre(organisme ?? "")}|${normaliserTitre(titre ?? "")}`;
      return `hash:${createHash("sha256").update(base).digest("hex")}`;
    }
    const canon = canoniserUrl(lien);
    if (canon) return `url:${canon}`;
  }

  const base = `${normaliserTitre(titre ?? "")}|${lien ?? ""}`;
  return `hash:${createHash("sha256").update(base).digest("hex")}`;
}

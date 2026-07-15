/**
 * URL canonique du site, utilisée pour le SEO : sitemap, robots, balises
 * canoniques, Open Graph, données structurées JSON-LD.
 *
 * Priorité :
 *   1. NEXT_PUBLIC_SITE_URL  — définie en production sur https://matchworks.app.
 *      C'est la source de vérité.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — fourni automatiquement par Vercel, pointe
 *      vers le domaine de production du projet.
 *   3. Fallback : le domaine officiel matchworks.app.
 *
 * NE PAS utiliser AUTH_URL pour le SEO : il vaut "http://localhost:3000" en
 * local et sert uniquement aux callbacks d'authentification.
 */
const FALLBACK = "https://matchworks.app";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return FALLBACK;
}

/** Construit une URL absolue à partir d'un chemin relatif. */
export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

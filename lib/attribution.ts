/**
 * Attribution d'acquisition légère (funnel fiche publique → clic CTA →
 * inscription), sans outil d'analytics tiers. Le cookie mw_ref est posé
 * côté client sur /inscription à partir du ?ref= porté par les CTA publics
 * (offre/catégorie/pays), puis lu côté serveur UNE SEULE FOIS à la création
 * du compte (credentials ou Google OAuth) — jamais réécrit ensuite.
 */

export const COOKIE_REF = "mw_ref";

const SOURCES_VALIDES = new Set(["offre", "categorie", "pays"]);

export function encoderRef(source: string, ref: string): string {
  return `${source}:${ref}`;
}

export function parserRef(valeur: string | undefined | null): { source: string; ref: string } | null {
  if (!valeur) return null;
  const i = valeur.indexOf(":");
  if (i < 0) return null;
  const source = valeur.slice(0, i);
  const ref = valeur.slice(i + 1).slice(0, 200); // borne large, offre/valeur inattendue sans crash
  if (!SOURCES_VALIDES.has(source) || !ref) return null;
  return { source, ref };
}

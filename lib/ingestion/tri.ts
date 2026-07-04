/**
 * Tri par VALIDITÉ (date limite), volontairement séparé de la RÉCENCE
 * (premiereVue = quand on a vu l'offre). Module pur (sans dépendance) pour
 * être testable isolément.
 */

export const SEUIL_CONFIANCE = 0.7; // en-dessous : l'admin doit fixer la date à la main

export type StatutTri = "a_valider" | "revue_manuelle" | "rejetee";

/**
 *   - date future + confiance ≥ seuil   → a_valider      (file admin)
 *   - date absente, OU confiance < seuil → revue_manuelle (file admin, signalé)
 *   - date passée + confiance ≥ seuil    → rejetee        (écartée, hors file)
 * JAMAIS de publication automatique : `publiee` n'est jamais renvoyé ici.
 */
export function trierSelonDeadline(
  dateLimite: Date | null,
  confiance: number | null,
  maintenant: Date,
): StatutTri {
  const c = confiance ?? 0;
  if (dateLimite && c >= SEUIL_CONFIANCE) {
    return dateLimite.getTime() > maintenant.getTime() ? "a_valider" : "rejetee";
  }
  // Date absente ou peu fiable (qu'elle soit future ou passée) → revue manuelle.
  return "revue_manuelle";
}

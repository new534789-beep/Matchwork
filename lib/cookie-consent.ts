/**
 * Consentement cookies — un seul cookie non-essentiel existe actuellement sur
 * le site (mw_ref, attribution marketing posée sur /inscription). Le choix de
 * l'utilisateur est mémorisé dans COOKIE_CONSENT, lui-même un cookie technique
 * (nécessaire pour ne pas réafficher la bannière à chaque visite) — pas soumis
 * à consentement, comme sur tous les sites.
 */
export const COOKIE_CONSENT = "mw_consent";

export type ChoixConsentement = "accepte" | "refuse";

function lireCookie(nom: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${nom}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/** true si l'utilisateur a explicitement accepté les cookies non-essentiels (marketing). */
export function aAccepteCookiesMarketing(): boolean {
  return lireCookie(COOKIE_CONSENT) === "accepte";
}

/** null = pas encore de choix exprimé (bannière à afficher). */
export function choixConsentementActuel(): ChoixConsentement | null {
  const v = lireCookie(COOKIE_CONSENT);
  return v === "accepte" || v === "refuse" ? v : null;
}

export function enregistrerConsentement(choix: ChoixConsentement) {
  document.cookie = `${COOKIE_CONSENT}=${choix}; path=/; max-age=${365 * 86400}; SameSite=Lax`;
}

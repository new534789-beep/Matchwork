/**
 * Modalité de l'opportunité (présentiel/en ligne/hybride/télétravail),
 * auto-détectée par mots-clés à la création — même principe que lib/pays.ts.
 * Heuristique volontairement prudente : mieux vaut null (non renseigné)
 * qu'un faux positif (ex. "à distance" décrit parfois l'entretien, pas le poste).
 */

export type Modalite = "presentiel" | "en_ligne" | "hybride" | "teletravail";

export const MODALITES: Modalite[] = ["presentiel", "en_ligne", "hybride", "teletravail"];

export const LABEL_MODALITE: Record<Modalite, string> = {
  presentiel: "Présentiel",
  en_ligne: "En ligne",
  hybride: "Hybride",
  teletravail: "Télétravail",
};

// Ordre important : hybride et télétravail avant présentiel/en ligne, pour ne
// pas classer en "présentiel" une offre qui mentionne aussi le télétravail.
const SIGNAUX: { modalite: Modalite; mots: string[] }[] = [
  { modalite: "hybride", mots: ["mode hybride", "travail hybride", "hybride (télétravail", "présentiel et télétravail"] },
  { modalite: "teletravail", mots: ["télétravail", "travail à distance", "100% remote", "full remote", "travail à domicile", "poste 100% distant"] },
  { modalite: "en_ligne", mots: ["formation en ligne", "cours en ligne", "programme en ligne", "e-learning", "mooc", "webinaire"] },
  { modalite: "presentiel", mots: ["en présentiel", "présence obligatoire", "poste sur site", "travail sur site"] },
];

export function detecterModalite(...textes: (string | null | undefined)[]): Modalite | null {
  const t = textes.filter(Boolean).join(" ").toLowerCase();
  for (const { modalite, mots } of SIGNAUX) {
    if (mots.some((m) => t.includes(m))) return modalite;
  }
  return null;
}

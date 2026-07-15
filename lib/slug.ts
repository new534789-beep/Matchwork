import { randomBytes } from "crypto";

const DIACRITIQUES = /[̀-ͯ]/g;

/** Convertit un texte libre en fragment d'URL : minuscules, sans accents, tirets. */
export function slugify(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(DIACRITIQUES, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

/**
 * Slug public d'une offre : lisible (intitulé + organisme) + suffixe aléatoire
 * pour garantir l'unicité sans dépendre de l'id (généré côté DB) ni d'un
 * aller-retour de vérification. Permanent : ne jamais régénérer pour une offre
 * existante, l'URL doit rester stable une fois indexée.
 */
export function genererSlugOpportunite(intitule: string, organisme: string): string {
  const base = slugify(`${intitule}-${organisme}`) || "offre";
  const suffixe = randomBytes(4).toString("hex");
  return `${base}-${suffixe}`;
}

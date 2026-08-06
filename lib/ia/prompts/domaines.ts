import { DOMAINES_VALEURS } from "@/lib/domaines";

export const SYSTEM_DOMAINES = `Tu classes une opportunité (bourse, emploi, stage, formation, appel à projets) dans un
ou plusieurs domaines d'étude/emploi, à partir de son titre, de sa description et de ses conditions.

Domaines possibles (utilise EXACTEMENT ces identifiants, jamais d'autre) :
${DOMAINES_VALEURS.map((v) => `- ${v}`).join("\n")}

Règles :
- Choisis un à trois domaines maximum, les plus pertinents seulement.
- Si l'offre est explicitement ouverte à "tous les domaines" ou "toutes disciplines" sans
  restriction, choisis les domaines réellement mentionnés dans le texte s'il y en a, sinon
  renvoie un tableau vide.
- N'invente jamais un domaine hors de la liste.
- Réponds UNIQUEMENT avec un objet JSON de la forme {"domaines": ["...", "..."]}, rien d'autre.`;

export function buildDomainesMessage(input: { intitule: string; description: string; conditions?: string | null }): string {
  return `Titre : ${input.intitule}
Description : ${input.description}
Conditions : ${input.conditions ?? "Non précisées"}

Classe cette opportunité.`;
}

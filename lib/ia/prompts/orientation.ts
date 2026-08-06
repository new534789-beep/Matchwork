/**
 * Prompt de la couche d'explication de l'IA Orientation.
 *
 * Cette couche ne calcule RIEN. Toutes les moyennes, tous les rangs, tous les
 * quotas lui arrivent déjà calculés par `lib/orientation/calcul.ts`, en
 * arithmétique déterministe et testée. Son unique travail est de mettre en
 * mots des chiffres qu'elle reçoit.
 *
 * C'est une contrainte de sécurité, pas de style : une moyenne inventée ici
 * enverrait un candidat vers la mauvaise filière pour toute une année.
 */

export const SYSTEM_ORIENTATION = `Tu commentes des résultats d'orientation post-bac au Bénin, déjà calculés.

TON RÔLE EST UNIQUEMENT DE METTRE EN MOTS DES CHIFFRES QU'ON TE DONNE.

INTERDICTIONS ABSOLUES :
- Ne calcule JAMAIS une moyenne, un rang, un total, un pourcentage. Tout t'est fourni.
- Ne cite JAMAIS un chiffre absent des données transmises. Pas d'arrondi « pratique », pas d'estimation, pas de « environ ».
- N'invente JAMAIS une filière, un établissement, une université, un débouché, un quota.
- Ne dis JAMAIS au candidat quoi choisir, ni quel ordre de choix adopter. Tu éclaires, tu ne décides pas.
- N'annonce JAMAIS une probabilité ou une chance d'obtenir une bourse. Ces seuils ne sont pas connus ; les affirmer serait mentir.
- Ne compare JAMAIS le candidat à d'autres candidats : tu ne sais rien d'eux.
- N'affirme JAMAIS qu'une matière « ne sert pas » ou « n'est pas utilisée ». Tu ne vois qu'une poignée de filières sur des centaines : une matière absente de celles qu'on te montre peut être décisive ailleurs. Tu ne peux parler que des filières explicitement listées, en citant leur formule.
- N'encourage ni ne décourage une filière pour des raisons de prestige, de genre, de revenu ou d'origine.

CE QUE TU FAIS :
- Tu expliques POURQUOI les moyennes diffèrent d'une filière à l'autre : le guide ne retient pas les mêmes trois matières selon la filière, et les coefficients dépendent de la série. C'est le point que les candidats comprennent le moins.
- Tu signales les écarts frappants dans SES propres résultats, en reprenant exactement les chiffres fournis.
- Tu nommes ses points forts d'après les notes et coefficients fournis, sans jamais les recalculer.
- Tu rappelles qu'une filière sur concours ne se joue pas sur la moyenne de classement.
- Tu invites à vérifier sur apresmonbac.bj, seule source officielle.

TON :
- Tutoiement, français simple, direct, sans jargon. Le lecteur a 18 ans et vient de passer son bac.
- Pas de flatterie ni de dramatisation. Des faits.
- Aucun emoji.
- 4 paragraphes maximum, 120 mots maximum au total.

Si les données transmises sont insuffisantes pour dire quelque chose d'utile, dis-le en une phrase plutôt que de broder.`;

export type DonneesExplication = {
  serie: string;
  moyenneGenerale: number | null;
  mention: string | null;
  /** Matières lues sur le relevé, telles quelles. */
  notes: { matiere: string; note: number; coefficient: number }[];
  nombreFilieresOuvertes: number;
  nombreCalculables: number;
  /** Les filières les mieux classées, déjà triées et calculées. */
  meilleures: {
    filiere: string;
    etablissement: string;
    moyenne: number;
    quotaBourse: number;
    quotaAideFpp: number;
    formule: string;
  }[];
  /** Les moins bien classées, pour illustrer l'écart. */
  plusBasses: { filiere: string; moyenne: number; formule: string }[];
  nombreSurConcours: number;
};

export function buildPromptOrientation(d: DonneesExplication): string {
  const lignes: string[] = [
    `Série : ${d.serie}`,
    d.moyenneGenerale !== null
      ? `Moyenne générale au bac : ${d.moyenneGenerale} (mention ${d.mention})`
      : `Moyenne générale au bac : non lue sur le relevé — ne l'évoque pas`,
    "",
    "Notes et coefficients lus sur son relevé :",
    ...d.notes.map((n) => `  - ${n.matiere} : ${n.note}/20, coefficient ${n.coefficient}`),
    "",
    `Filières qui lui sont ouvertes : ${d.nombreFilieresOuvertes}`,
    `Filières avec une moyenne de classement calculable : ${d.nombreCalculables}`,
    `Filières sur concours parmi celles ouvertes : ${d.nombreSurConcours}`,
    "",
    "Ses filières les mieux classées :",
    ...d.meilleures.map(
      (m) =>
        `  - ${m.filiere} (${m.etablissement}) : ${m.moyenne.toFixed(2)}/20` +
        ` — ${m.quotaBourse} bourses, ${m.quotaAideFpp} aides — calcul : ${m.formule}`,
    ),
    "",
    "Ses filières les moins bien classées :",
    ...d.plusBasses.map(
      (m) => `  - ${m.filiere} : ${m.moyenne.toFixed(2)}/20 — calcul : ${m.formule}`,
    ),
    "",
    "Commente ces résultats en respectant strictement tes règles.",
  ];
  return lignes.join("\n");
}

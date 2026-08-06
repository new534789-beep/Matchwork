/**
 * Domaines d'étude/emploi — taxonomie fixe utilisée pour classer chaque
 * opportunité (par IA, voir lib/ia/classification-domaines.ts) et pour le
 * filtre de recherche (app/(app)/opportunites/FilSwipe.tsx). Source unique de
 * vérité : ajouter un domaine ici le rend disponible partout.
 */
export type DomaineDef = { valeur: string; label: string };

export const DOMAINES: DomaineDef[] = [
  { valeur: "droit", label: "Droit" },
  { valeur: "maths-info", label: "Maths & Informatique" },
  { valeur: "lettres-langues", label: "Lettres & Langues" },
  { valeur: "geographie-geomatique", label: "Géographie & Géomatique" },
  { valeur: "ingenierie", label: "Ingénierie" },
  { valeur: "genie-civil", label: "Génie civil" },
  { valeur: "environnement", label: "Environnement & Transition écologique" },
  { valeur: "culture-patrimoine", label: "Culture & Patrimoine" },
  { valeur: "agriculture", label: "Agriculture" },
  { valeur: "sante", label: "Santé" },
  { valeur: "communication-marketing", label: "Communication & Marketing" },
  { valeur: "sciences-vie", label: "Sciences de la vie" },
  { valeur: "finance-comptabilite", label: "Finance & Comptabilité" },
  { valeur: "shs", label: "Sciences humaines & sociales" },
  { valeur: "hotellerie-tourisme", label: "Hôtellerie & Tourisme" },
];

export const DOMAINES_VALEURS = DOMAINES.map((d) => d.valeur);

export function parseDomaines(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

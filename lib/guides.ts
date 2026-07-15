/**
 * Registre des guides (contenu éditorial SEO/GEO). Chaque guide a un fichier
 * de contenu dédié dans app/(public)/guides/[slug]/contenu/ — pas de CMS,
 * cohérent avec le reste du site (composants React, pas de Markdown/MDX).
 */
export type Guide = {
  slug: string;
  titre: string;
  titreCourt: string; // pour les cartes de listing
  description: string; // meta description + résumé de carte
  motsCles: string[];
  datePublication: string; // ISO
  dureeLecture: string;
  categorie: "bourses" | "candidature" | "emploi" | "projets";
};

export const GUIDES: Guide[] = [
  {
    slug: "lettre-de-motivation-bourse-etude",
    titre: "Comment rédiger une lettre de motivation pour une bourse d'études (avec exemple)",
    titreCourt: "Rédiger une lettre de motivation pour une bourse",
    description:
      "Le guide complet pour écrire une lettre de motivation de bourse qui se démarque : structure, erreurs à éviter, exemple concret phrase par phrase.",
    motsCles: ["lettre de motivation bourse", "modèle lettre de motivation bourse d'études", "comment candidater à une bourse"],
    datePublication: "2026-07-14",
    dureeLecture: "8 min",
    categorie: "candidature",
  },
  {
    slug: "bourse-campus-france-guide",
    titre: "Bourse Campus France 2026 : le guide complet pour candidater",
    titreCourt: "Bourse Campus France 2026 : guide complet",
    description:
      "Comment candidater à une bourse Campus France en 2026 : conditions, calendrier, dossier à préparer, erreurs qui font rejeter une candidature.",
    motsCles: ["bourse Campus France 2026", "candidature Campus France", "bourse étude France Afrique"],
    datePublication: "2026-07-14",
    dureeLecture: "10 min",
    categorie: "bourses",
  },
  {
    slug: "cv-premier-emploi-afrique-ouest",
    titre: "Comment rédiger un CV pour décrocher un premier emploi en Afrique de l'Ouest",
    titreCourt: "CV pour un premier emploi en Afrique de l'Ouest",
    description:
      "Structurer un CV efficace sans expérience professionnelle : mettre en valeur ses stages, projets et compétences pour convaincre un recruteur.",
    motsCles: ["CV premier emploi", "CV sans expérience", "rédiger un CV Afrique de l'Ouest"],
    datePublication: "2026-07-14",
    dureeLecture: "7 min",
    categorie: "emploi",
  },
  {
    slug: "note-conceptuelle-appel-projet",
    titre: "Comment rédiger une note conceptuelle pour un appel à projets",
    titreCourt: "Rédiger une note conceptuelle pour un appel à projets",
    description:
      "La structure exacte d'une note conceptuelle convaincante pour un bailleur de fonds : contexte, objectifs, méthodologie, budget résumé.",
    motsCles: ["note conceptuelle", "appel à projets Afrique", "financement projet jeunes"],
    datePublication: "2026-07-14",
    dureeLecture: "9 min",
    categorie: "projets",
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/**
 * Configuration SEO des catégories publiques d'offres.
 * Source unique de vérité pour : pages catégories publiques, sitemap, fil d'Ariane,
 * métadonnées. Chaque catégorie a une URL propre, riche en mots-clés.
 *
 * `types` regroupe un ou plusieurs types de la base sous une même catégorie
 * publique (ex. "bourses" couvre BOURSE et BOURSE_ETUDE).
 */
export type CategorieSeo = {
  slug: string;
  labelPluriel: string;
  types: string[];
  h1: string;
  titre: string;
  description: string;
  introduction: string;
};

export const CATEGORIES_SEO: CategorieSeo[] = [
  {
    slug: "bourses",
    labelPluriel: "Bourses d'études",
    types: ["BOURSE", "BOURSE_ETUDE"],
    h1: "Bourses d'études en Afrique de l'Ouest",
    titre: "Bourses d'études 2026 en Afrique de l'Ouest | Matchwork",
    description:
      "Trouvez des bourses d'études pour l'Afrique de l'Ouest : licence, master, doctorat. Bourses locales et internationales mises à jour, avec dates limites et conditions.",
    introduction:
      "Découvrez les bourses d'études ouvertes aux candidats d'Afrique de l'Ouest francophone. Chaque bourse est vérifiée, avec sa date limite, ses conditions d'éligibilité et les pièces à fournir.",
  },
  {
    slug: "emplois",
    labelPluriel: "Offres d'emploi",
    types: ["EMPLOI"],
    h1: "Offres d'emploi en Afrique de l'Ouest",
    titre: "Offres d'emploi en Afrique de l'Ouest | Matchwork",
    description:
      "Des milliers d'offres d'emploi pour l'Afrique de l'Ouest, triées et mises à jour. Postulez avec un CV et une lettre de motivation générés pour chaque poste.",
    introduction:
      "Parcourez les offres d'emploi ouvertes aux candidats d'Afrique de l'Ouest. Pour chaque poste, Matchwork peut générer un CV et une lettre de motivation adaptés en quelques minutes.",
  },
  {
    slug: "concours",
    labelPluriel: "Concours",
    types: ["CONCOURS"],
    h1: "Concours en Afrique de l'Ouest",
    titre: "Concours 2026 en Afrique de l'Ouest | Matchwork",
    description:
      "Concours de la fonction publique, concours d'entrée et compétitions ouverts aux candidats d'Afrique de l'Ouest, avec dates limites et conditions.",
    introduction:
      "Retrouvez les concours ouverts aux candidats d'Afrique de l'Ouest. Chaque concours est vérifié, avec sa date limite et ses conditions de participation.",
  },
  {
    slug: "residences",
    labelPluriel: "Résidences",
    types: ["RESIDENCE"],
    h1: "Résidences en Afrique de l'Ouest",
    titre: "Résidences 2026 en Afrique de l'Ouest | Matchwork",
    description:
      "Résidences d'artistes, de recherche ou entrepreneuriales ouvertes aux candidats d'Afrique de l'Ouest, avec dates limites et conditions.",
    introduction:
      "Découvrez les résidences ouvertes aux candidats d'Afrique de l'Ouest. Chaque résidence est vérifiée, avec sa date limite et ses conditions d'éligibilité.",
  },
  {
    slug: "stages",
    labelPluriel: "Stages",
    types: ["STAGE"],
    h1: "Offres de stage en Afrique de l'Ouest",
    titre: "Offres de stage en Afrique de l'Ouest | Matchwork",
    description:
      "Trouvez un stage adapté à votre profil en Afrique de l'Ouest. Offres à jour avec durée, localisation, conditions et documents requis.",
    introduction:
      "Trouvez le stage qui correspond à votre parcours. Chaque offre indique la durée, le lieu et les documents à préparer pour candidater.",
  },
  {
    slug: "formations",
    labelPluriel: "Formations",
    types: ["FORMATION"],
    h1: "Formations et programmes en Afrique de l'Ouest",
    titre: "Formations et programmes en Afrique de l'Ouest | Matchwork",
    description:
      "Formations professionnelles, bootcamps et programmes courts ouverts aux candidats d'Afrique de l'Ouest. Dates, conditions et modalités d'inscription.",
    introduction:
      "Développez vos compétences avec des formations sélectionnées pour l'Afrique de l'Ouest : bootcamps, certifications et programmes courts.",
  },
  {
    slug: "admissions",
    labelPluriel: "Admissions",
    types: ["ADMISSION"],
    h1: "Admissions universitaires en Afrique de l'Ouest",
    titre: "Admissions universitaires en Afrique de l'Ouest | Matchwork",
    description:
      "Programmes universitaires et admissions ouverts aux candidats d'Afrique de l'Ouest : master, licence, écoles. Dates et pièces requises.",
    introduction:
      "Préparez votre admission dans un programme universitaire. Retrouvez les cursus ouverts, leurs dates limites et les documents à fournir.",
  },
  {
    slug: "appels-projets",
    labelPluriel: "Appels à projets",
    types: ["APPEL_PROJET"],
    h1: "Appels à projets et financements en Afrique de l'Ouest",
    titre: "Appels à projets et financements en Afrique de l'Ouest | Matchwork",
    description:
      "Appels à projets, subventions et financements pour entrepreneurs et porteurs de projets en Afrique de l'Ouest. Montants, critères et dates limites.",
    introduction:
      "Financez votre projet grâce aux appels à propositions ouverts en Afrique de l'Ouest. Matchwork vous aide à monter une note conceptuelle et un budget solides.",
  },
];

export function getCategorieBySlug(slug: string): CategorieSeo | undefined {
  return CATEGORIES_SEO.find((c) => c.slug === slug);
}

/** Retrouve le slug de catégorie publique correspondant à un type de la base. */
export function slugForType(type: string): string | undefined {
  return CATEGORIES_SEO.find((c) => c.types.includes(type))?.slug;
}

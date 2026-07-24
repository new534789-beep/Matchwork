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
  {
    slug: "documents-a-fournir-bourse-etude",
    titre: "Quels documents fournir pour candidater à une bourse d'études (checklist complète)",
    titreCourt: "Documents à fournir pour une bourse d'études",
    description:
      "La liste complète et réaliste des pièces à réunir pour un dossier de bourse : diplômes, relevés, certificats de langue, lettres de recommandation, et comment les organiser sans stress.",
    motsCles: ["documents bourse d'études", "pièces à fournir bourse", "checklist candidature bourse"],
    datePublication: "2026-07-16",
    dureeLecture: "7 min",
    categorie: "bourses",
  },
  {
    slug: "cv-bourse-etude-academique",
    titre: "Comment rédiger un CV académique pour une bourse d'études (différent d'un CV pro)",
    titreCourt: "CV académique pour une bourse d'études",
    description:
      "Un CV de bourse ne se lit pas comme un CV d'emploi : ce que les jurys académiques cherchent vraiment, et comment structurer un CV académique convaincant.",
    motsCles: ["CV académique bourse", "CV bourse d'études", "CV candidature universitaire"],
    datePublication: "2026-07-16",
    dureeLecture: "7 min",
    categorie: "bourses",
  },
  {
    slug: "reconnaitre-fausse-offre-emploi-bourse-afrique",
    titre: "Comment reconnaître une fausse offre d'emploi ou de bourse en Afrique de l'Ouest",
    titreCourt: "Reconnaître une arnaque à l'emploi ou à la bourse",
    description:
      "Les signaux d'alerte concrets d'une offre frauduleuse (frais demandés, adresses email douteuses, promesses trop belles) et comment vérifier une offre avant d'y répondre.",
    motsCles: ["arnaque offre d'emploi Afrique", "fausse bourse d'études", "vérifier une offre d'emploi"],
    datePublication: "2026-07-16",
    dureeLecture: "6 min",
    categorie: "candidature",
  },
  {
    slug: "lettre-de-motivation-stage",
    titre: "Comment rédiger une lettre de motivation pour un stage (avec exemple)",
    titreCourt: "Rédiger une lettre de motivation pour un stage",
    description:
      "Une lettre de stage ne se juge pas comme une lettre d'emploi : ce que l'entreprise attend vraiment d'un stagiaire, structure et exemple concret.",
    motsCles: ["lettre de motivation stage", "modèle lettre stage", "candidater à un stage"],
    datePublication: "2026-07-16",
    dureeLecture: "6 min",
    categorie: "candidature",
  },
  {
    slug: "niveau-langue-requis-bourse-tcf-toefl-ielts",
    titre: "TCF, TOEFL, IELTS : quel niveau de langue faut-il pour candidater à une bourse ?",
    titreCourt: "Quel niveau de langue pour une bourse d'études",
    description:
      "Comprendre les certifications de langue exigées par les bourses (TCF, TOEFL, IELTS, DELF/DALF) : niveaux requis, différences entre tests, et comment savoir lequel passer.",
    motsCles: ["TCF pour bourse", "TOEFL bourse d'études", "niveau de langue bourse Campus France"],
    datePublication: "2026-07-16",
    dureeLecture: "7 min",
    categorie: "bourses",
  },
  {
    slug: "reussir-entretien-embauche-visio",
    titre: "Comment réussir un entretien d'embauche en visioconférence",
    titreCourt: "Réussir un entretien d'embauche en visio",
    description:
      "Préparation technique, posture, réponses aux questions pièges : comment transformer un entretien en visio en avantage plutôt qu'en obstacle.",
    motsCles: ["entretien embauche visio", "préparer entretien vidéo", "entretien d'embauche en ligne"],
    datePublication: "2026-07-16",
    dureeLecture: "6 min",
    categorie: "emploi",
  },
  {
    slug: "bourse-etude-ou-pret-etudiant",
    titre: "Bourse d'études ou prêt étudiant : comment financer ses études à l'étranger",
    titreCourt: "Bourse d'études ou prêt étudiant ?",
    description:
      "Comparer bourse et prêt étudiant pour financer des études à l'étranger : avantages, risques réels du prêt, et comment maximiser ses chances d'obtenir une bourse d'abord.",
    motsCles: ["financer ses études à l'étranger", "bourse ou prêt étudiant", "financement études Afrique"],
    datePublication: "2026-07-16",
    dureeLecture: "7 min",
    categorie: "bourses",
  },
  {
    slug: "trouver-appels-projets-fiables-jeunes-entrepreneurs-afrique",
    titre: "Où trouver des appels à projets fiables pour jeunes entrepreneurs en Afrique",
    titreCourt: "Trouver des appels à projets fiables",
    description:
      "Les sources sérieuses d'appels à projets et de financements pour entrepreneurs africains, et comment distinguer un vrai bailleur d'une opportunité douteuse.",
    motsCles: ["appel à projets jeunes entrepreneurs", "financement projet Afrique", "où trouver des appels à projets"],
    datePublication: "2026-07-16",
    dureeLecture: "7 min",
    categorie: "projets",
  },
  {
    slug: "preparer-dossier-admission-universite-etranger",
    titre: "Comment préparer un dossier d'admission universitaire à l'étranger",
    titreCourt: "Préparer un dossier d'admission à l'étranger",
    description:
      "Les pièces attendues, le calendrier à respecter et les erreurs qui font rejeter un dossier d'admission dans une université étrangère.",
    motsCles: ["dossier admission université étranger", "candidater à l'université à l'étranger", "admission université internationale"],
    datePublication: "2026-07-16",
    dureeLecture: "8 min",
    categorie: "bourses",
  },
  {
    slug: "visa-etudiant-apres-bourse",
    titre: "Comment obtenir un visa étudiant après avoir décroché une bourse",
    titreCourt: "Obtenir un visa étudiant après une bourse",
    description:
      "Les démarches à enclencher dès l'obtention d'une bourse : type de visa, justificatifs financiers, délais réalistes à anticiper.",
    motsCles: ["visa étudiant après bourse", "démarches visa étudiant", "visa étudiant Campus France"],
    datePublication: "2026-07-16",
    dureeLecture: "7 min",
    categorie: "bourses",
  },
  {
    slug: "preparer-concours-fonction-publique",
    titre: "Comment se préparer à un concours de la fonction publique",
    titreCourt: "Se préparer à un concours de la fonction publique",
    description:
      "Méthode de préparation, planning de révision et pièges à éviter pour un concours administratif (auditeurs, greffiers, agents de santé, police).",
    motsCles: ["préparer concours fonction publique", "concours administratif Afrique", "réussir un concours de recrutement"],
    datePublication: "2026-07-16",
    dureeLecture: "8 min",
    categorie: "candidature",
  },
  {
    slug: "relancer-candidature-sans-reponse",
    titre: "Comment relancer une candidature restée sans réponse (avec modèle)",
    titreCourt: "Relancer une candidature sans réponse",
    description:
      "Quand et comment relancer un recruteur ou un jury de bourse sans paraître insistant : délai à respecter, ton à adopter, modèle de message.",
    motsCles: ["relancer une candidature", "relance candidature sans réponse", "modèle email de relance"],
    datePublication: "2026-07-16",
    dureeLecture: "5 min",
    categorie: "candidature",
  },
  {
    slug: "que-faire-apres-refus-bourse",
    titre: "Bourse refusée : comment rebondir et ne pas repartir de zéro",
    titreCourt: "Que faire après un refus de bourse",
    description:
      "Comprendre pourquoi un dossier de bourse est refusé, quoi corriger avant la prochaine candidature, et comment réutiliser le travail déjà fait.",
    motsCles: ["refus de bourse", "candidature bourse refusée", "que faire après un refus de bourse"],
    datePublication: "2026-07-16",
    dureeLecture: "6 min",
    categorie: "bourses",
  },
  {
    slug: "financer-stage-non-remunere-etranger",
    titre: "Comment financer un stage non rémunéré à l'étranger",
    titreCourt: "Financer un stage non rémunéré",
    description:
      "Les options réelles pour couvrir les frais d'un stage non rémunéré ou peu rémunéré à l'étranger : bourses de mobilité, aides ponctuelles, alternatives.",
    motsCles: ["financer un stage non rémunéré", "bourse de mobilité stage", "stage à l'étranger sans argent"],
    datePublication: "2026-07-16",
    dureeLecture: "6 min",
    categorie: "candidature",
  },
  {
    slug: "optimiser-profil-linkedin-emploi-afrique",
    titre: "Comment optimiser son profil LinkedIn pour trouver un emploi en Afrique de l'Ouest",
    titreCourt: "Optimiser son profil LinkedIn en Afrique de l'Ouest",
    description:
      "Photo, titre, résumé, mots-clés : ce qui fait qu'un profil LinkedIn est vraiment repéré par les recruteurs du marché ouest-africain.",
    motsCles: ["profil LinkedIn emploi Afrique", "optimiser LinkedIn recherche emploi", "LinkedIn recruteur Afrique de l'Ouest"],
    datePublication: "2026-07-16",
    dureeLecture: "7 min",
    categorie: "emploi",
  },
  {
    slug: "bourse-doctorat-vs-master",
    titre: "Bourse de doctorat : ce qui change vraiment par rapport à une bourse de master",
    titreCourt: "Bourse de doctorat vs bourse de master",
    description:
      "Directeur de thèse, projet de recherche, financement pluriannuel : les différences essentielles entre candidater à une bourse de doctorat et de master.",
    motsCles: ["bourse de doctorat", "candidater en doctorat à l'étranger", "financement thèse Afrique"],
    datePublication: "2026-07-16",
    dureeLecture: "8 min",
    categorie: "bourses",
  },
  {
    slug: "bourse-uemoa-guide-complet",
    titre: "Bourse d'Excellence UEMOA : le guide complet pour candidater",
    titreCourt: "Bourse d'Excellence UEMOA : guide complet",
    description:
      "Conditions par niveau (Licence, Master, Doctorat), dossier à préparer et erreurs à éviter pour candidater à la Bourse d'Excellence de l'UEMOA.",
    motsCles: ["bourse UEMOA", "bourse d'excellence UEMOA", "candidater bourse UEMOA"],
    datePublication: "2026-07-16",
    dureeLecture: "8 min",
    categorie: "bourses",
  },
  {
    slug: "bourse-mastercard-foundation-guide",
    titre: "Mastercard Foundation Scholars Program : comment candidater (guide complet)",
    titreCourt: "Bourse Mastercard Foundation : guide complet",
    description:
      "Comprendre le fonctionnement en réseau du programme Mastercard Foundation, le profil recherché, et comment identifier la bonne université partenaire.",
    motsCles: ["Mastercard Foundation Scholars Program", "bourse Mastercard Foundation Afrique", "candidater bourse Mastercard"],
    datePublication: "2026-07-16",
    dureeLecture: "7 min",
    categorie: "bourses",
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

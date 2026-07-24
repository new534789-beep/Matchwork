// Checklist post-obtention : étapes déterministes selon le type d'offre,
// affichées une fois le candidat a marqué un dossier comme « obtenu ».
// Volontairement un template fixe (pas d'IA) : les étapes administratives
// après une bourse/un emploi sont connues et stables, pas la peine d'en
// payer la génération ni d'en risquer l'hallucination.

export type EtapeTemplate = { texte: string; lienGuide?: string };

const ETAPES_BOURSE: EtapeTemplate[] = [
  { texte: "Confirmer par écrit votre acceptation auprès de l'organisme" },
  { texte: "Réunir les documents pour la demande de visa (passeport valide, lettre d'admission, preuve de financement)", lienGuide: "visa-etudiant-apres-bourse" },
  { texte: "Faire la demande de visa étudiant", lienGuide: "visa-etudiant-apres-bourse" },
  { texte: "Souscrire une assurance santé/voyage valable sur place" },
  { texte: "Organiser le logement sur place" },
  { texte: "Réserver le billet d'avion" },
];

const ETAPES_EMPLOI: EtapeTemplate[] = [
  { texte: "Confirmer votre acceptation du poste par écrit" },
  { texte: "Lire attentivement et signer le contrat de travail" },
  { texte: "Réunir les documents administratifs demandés (pièce d'identité, diplômes, RIB)" },
  { texte: "Prévoir votre période de préavis si vous quittez un poste actuel" },
  { texte: "Préparer votre intégration (date de début, logistique du premier jour)" },
];

const ETAPES_STAGE: EtapeTemplate[] = [
  { texte: "Confirmer les dates et modalités du stage" },
  { texte: "Signer la convention de stage" },
  { texte: "Réunir les documents requis (assurance, pièce d'identité)" },
  { texte: "Organiser le logement et le transport si le stage est hors de votre ville" },
];

const ETAPES_ADMISSION_FORMATION: EtapeTemplate[] = [
  { texte: "Confirmer votre inscription auprès de l'établissement" },
  { texte: "Réunir les documents administratifs demandés" },
  { texte: "Payer les frais d'inscription si applicable" },
  { texte: "Préparer votre installation (logement, transport)" },
];

const ETAPES_PROJET_RECOMPENSE: EtapeTemplate[] = [
  { texte: "Confirmer la réception du financement ou du prix" },
  { texte: "Signer la convention de subvention si applicable" },
  { texte: "Préparer le plan de mise en œuvre du projet" },
  { texte: "Noter les échéances de reporting demandées par le bailleur" },
];

const PAR_TYPE: Record<string, EtapeTemplate[]> = {
  BOURSE: ETAPES_BOURSE,
  EMPLOI: ETAPES_EMPLOI,
  STAGE: ETAPES_STAGE,
  FORMATION: ETAPES_ADMISSION_FORMATION,
  ADMISSION: ETAPES_ADMISSION_FORMATION,
  APPEL_PROJET: ETAPES_PROJET_RECOMPENSE,
  RECOMPENSE: ETAPES_PROJET_RECOMPENSE,
};

export function genererEtapesPostObtention(typeOpportunite: string): EtapeTemplate[] {
  return PAR_TYPE[typeOpportunite] ?? ETAPES_ADMISSION_FORMATION;
}

// Constantes partagées (client + serveur) pour les opportunités.

export const TYPES_OPP = ["BOURSE", "BOURSE_ETUDE", "FORMATION", "EMPLOI", "CONCOURS", "STAGE", "RESIDENCE", "ADMISSION", "APPEL_PROJET"] as const;

export const LABEL_TYPE: Record<string, string> = {
  BOURSE: "Bourse",
  BOURSE_ETUDE: "Bourse d'études",
  FORMATION: "Formation",
  EMPLOI: "Emploi",
  CONCOURS: "Concours",
  STAGE: "Stage",
  RESIDENCE: "Résidence",
  ADMISSION: "Admission",
  APPEL_PROJET: "Appel à projets",
};

export const STATUTS_OPP = ["brouillon", "a_valider", "revue_manuelle", "publiee", "expiree", "rejetee"] as const;

export const LABEL_STATUT: Record<string, string> = {
  brouillon: "Brouillon (en attente IA)",
  a_valider: "À valider",
  revue_manuelle: "Revue manuelle",
  publiee: "Publiée",
  expiree: "Expirée",
  rejetee: "Rejetée",
};

// Statuts qui apparaissent dans la file de validation admin.
export const STATUTS_EN_FILE = ["a_valider", "revue_manuelle"] as const;

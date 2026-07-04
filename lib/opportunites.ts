// Constantes partagées (client + serveur) pour les opportunités.

export const TYPES_OPP = ["BOURSE", "FORMATION", "EMPLOI", "CONCOURS", "STAGE", "RESIDENCE"] as const;

export const LABEL_TYPE: Record<string, string> = {
  BOURSE: "Bourse",
  FORMATION: "Formation",
  EMPLOI: "Emploi",
  CONCOURS: "Concours",
  STAGE: "Stage",
  RESIDENCE: "Résidence",
};

export const STATUTS_OPP = ["a_valider", "revue_manuelle", "publiee", "expiree", "rejetee"] as const;

export const LABEL_STATUT: Record<string, string> = {
  a_valider: "À valider",
  revue_manuelle: "Revue manuelle",
  publiee: "Publiée",
  expiree: "Expirée",
  rejetee: "Rejetée",
};

// Statuts qui apparaissent dans la file de validation admin.
export const STATUTS_EN_FILE = ["a_valider", "revue_manuelle"] as const;

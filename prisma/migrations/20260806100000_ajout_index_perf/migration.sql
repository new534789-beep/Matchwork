-- Performance (phase 5.1 du plan) : index sur les colonnes filtrées en
-- permanence par les requêtes de l'espace connecté. IF NOT EXISTS rend la
-- migration idempotente, conforme à la convention des migrations récentes de
-- ce dépôt (historique Prisma cassé, objets déjà présents en dev via `db push`).

-- Opportunite : fil de swipe et pages catégorie (type + actif + statut, tri par
-- dateLimite) — cache des listes d'opportunités (phase 5.2).
CREATE INDEX IF NOT EXISTS "opportunites_type_actif_statut_dateLimite_idx"
  ON "opportunites"("type", "actif", "statut", "dateLimite");

-- Interaction : groupBy/count par décision d'un utilisateur (tableau de bord)
-- et liste des offres déjà vues (filtre par utilisateur).
CREATE INDEX IF NOT EXISTS "interactions_userId_decision_idx"
  ON "interactions"("userId", "decision");

-- Dossier : liste des dossiers d'un utilisateur, triée par updatedAt
-- (tableau de bord, candidatures).
CREATE INDEX IF NOT EXISTS "dossiers_userId_updatedAt_idx"
  ON "dossiers"("userId", "updatedAt");

-- Document : listing du coffre-fort et comptage/typologie des pièces
-- (tableau de bord).
CREATE INDEX IF NOT EXISTS "documents_userId_idx"
  ON "documents"("userId");

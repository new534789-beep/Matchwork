-- Parrainage : générations bonus offertes au parrain (+3 par filleul inscrit).
-- Ajoutée via `db push` en dev (historique de migration cassé — voir
-- 20260716100000_add_article_blog). IF NOT EXISTS rend cette migration
-- idempotente (sûre à rejouer même si dev possède déjà la colonne).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "generationsBonus" INTEGER NOT NULL DEFAULT 0;

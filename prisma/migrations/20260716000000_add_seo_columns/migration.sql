-- AlterTable: colonnes SEO (slug/pays/modalite) sur opportunites, ajoutées au
-- schéma via `db push` sans migration correspondante -- présentes en dev mais
-- ABSENTES en prod. Comme pour add_acquisition_columns, cette absence ferait
-- planter (P2022) toute requête sur Opportunite (fil de swipe, tableau de bord,
-- détail d'offre, pages SEO /offres) dès que ce schéma serait déployé.
-- IF NOT EXISTS rend la migration idempotente.
ALTER TABLE "opportunites" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "opportunites" ADD COLUMN IF NOT EXISTS "pays" TEXT;
ALTER TABLE "opportunites" ADD COLUMN IF NOT EXISTS "modalite" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "opportunites_slug_key" ON "opportunites"("slug");
CREATE INDEX IF NOT EXISTS "opportunites_pays_idx" ON "opportunites"("pays");
CREATE INDEX IF NOT EXISTS "opportunites_modalite_idx" ON "opportunites"("modalite");

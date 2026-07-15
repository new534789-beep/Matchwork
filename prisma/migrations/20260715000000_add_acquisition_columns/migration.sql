-- AlterTable: colonnes d'attribution d'acquisition sur users (funnel SEO fiche
-- publique -> inscription). Ajoutées au schéma via `db push` sans migration
-- correspondante : présentes en dev mais ABSENTES en prod. Cette absence faisait
-- échouer tout `findUnique`/`authorize` renvoyant l'objet User complet (le SELECT
-- inclut ces colonnes) -> connexion email ET Google cassées (« ACCÈS refusé » /
-- rebond vers /connexion). `IF NOT EXISTS` rend la migration idempotente (la base
-- dev les possède déjà).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sourceAcquisition" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "refAcquisition" TEXT;

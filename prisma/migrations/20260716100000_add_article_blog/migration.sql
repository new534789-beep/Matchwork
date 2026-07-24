-- CreateTable: table "articles" (blog automatisé), ajoutée au schéma via
-- `db push` (historique de migration cassé — voir 20260622165456_init, écrite
-- pour SQLite et invalide en Postgres, empêche `prisma migrate dev` de rejouer
-- la base fantôme). Présente en dev mais ABSENTE en prod tant que cette
-- migration n'est pas déployée. IF NOT EXISTS rend la migration idempotente
-- (la base dev possède déjà la table).
CREATE TABLE IF NOT EXISTS "articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "extrait" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "imageCouverture" TEXT,
    "categorie" TEXT,
    "motsCles" TEXT NOT NULL DEFAULT '[]',
    "statut" TEXT NOT NULL DEFAULT 'publie',
    "seoTitre" TEXT,
    "seoDescription" TEXT,
    "opportuniteId" TEXT,
    "publieLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "articles_slug_key" ON "articles"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "articles_opportuniteId_key" ON "articles"("opportuniteId");
CREATE INDEX IF NOT EXISTS "articles_statut_idx" ON "articles"("statut");

DO $$ BEGIN
    ALTER TABLE "articles" ADD CONSTRAINT "articles_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "opportunites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

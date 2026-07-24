-- Fonctionnalités Pro ajoutées via `db push` en dev (historique de migration
-- cassé — voir 20260716100000_add_article_blog) : multi-profils, alertes
-- intelligentes, relance automatique, checklist post-obtention. IF NOT
-- EXISTS/IF EXISTS rend cette migration idempotente (sûre à rejouer même si
-- dev possède déjà ces objets).

-- ─── Multi-profils (Pro) ─────────────────────────────────────────────────
-- Un utilisateur peut avoir plusieurs profils complets. On retire la
-- contrainte unique sur userId (remplacée par un index simple), et on ajoute
-- nom (libellé) + actif (profil utilisé par défaut).
DROP INDEX IF EXISTS "profils_userId_key";
CREATE INDEX IF NOT EXISTS "profils_userId_idx" ON "profils"("userId");

ALTER TABLE "profils" ADD COLUMN IF NOT EXISTS "nom" TEXT NOT NULL DEFAULT 'Profil principal';
ALTER TABLE "profils" ADD COLUMN IF NOT EXISTS "actif" BOOLEAN NOT NULL DEFAULT true;

-- ─── Relance automatique + checklist post-obtention (Pro) ──────────────────
ALTER TABLE "dossiers" ADD COLUMN IF NOT EXISTS "relanceEnvoyeeLe" TIMESTAMP(3);
ALTER TABLE "dossiers" ADD COLUMN IF NOT EXISTS "dateObtention" TIMESTAMP(3);
ALTER TABLE "dossiers" ADD COLUMN IF NOT EXISTS "checklistRelanceEnvoyeeLe" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "etapes_post_obtention" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "lienGuide" TEXT,
    "fait" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etapes_post_obtention_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "etapes_post_obtention_dossierId_idx" ON "etapes_post_obtention"("dossierId");

DO $$ BEGIN
    ALTER TABLE "etapes_post_obtention" ADD CONSTRAINT "etapes_post_obtention_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ─── Alertes intelligentes (Pro) : dédup des notifications push ────────────
CREATE TABLE IF NOT EXISTS "alertes_envoyees" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportuniteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertes_envoyees_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "alertes_envoyees_userId_opportuniteId_key" ON "alertes_envoyees"("userId", "opportuniteId");
CREATE INDEX IF NOT EXISTS "alertes_envoyees_userId_idx" ON "alertes_envoyees"("userId");

DO $$ BEGIN
    ALTER TABLE "alertes_envoyees" ADD CONSTRAINT "alertes_envoyees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "alertes_envoyees" ADD CONSTRAINT "alertes_envoyees_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "opportunites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

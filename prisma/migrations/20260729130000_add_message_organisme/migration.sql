-- Messagerie bidirectionnelle organisme ↔ candidat : organismeId sert de
-- frontière d'autorisation (un organisme ne voit que ses propres échanges).
-- Ajoutée via `db push` en dev (historique de migration cassé — voir
-- 20260716100000_add_article_blog). IF NOT EXISTS rend cette migration
-- idempotente.
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "organismeId" TEXT;

CREATE INDEX IF NOT EXISTS "messages_organismeId_idx" ON "messages"("organismeId");

DO $$ BEGIN
    ALTER TABLE "messages" ADD CONSTRAINT "messages_organismeId_fkey" FOREIGN KEY ("organismeId") REFERENCES "organismes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

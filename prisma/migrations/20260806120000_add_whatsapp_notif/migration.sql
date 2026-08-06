-- Alertes WhatsApp (Cloud API) : consentement explicite des utilisateurs Pro.
-- ADD COLUMN IF NOT EXISTS rend la migration idempotente, conforme à la
-- convention des migrations récentes de ce dépôt (historique Prisma cassé,
-- objets déjà présents en dev via `db push`).

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "notifWhatsapp" BOOLEAN NOT NULL DEFAULT false;

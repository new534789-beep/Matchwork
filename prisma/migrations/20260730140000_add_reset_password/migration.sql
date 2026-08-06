-- Réinitialisation de mot de passe : hash du token (jamais le token en clair)
-- + expiration. IF NOT EXISTS rend cette migration idempotente (déjà
-- appliquée en dev via `db push`).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resetTokenHash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resetTokenExpire" TIMESTAMP(3);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_resetTokenHash_key'
  ) THEN
    ALTER TABLE "users" ADD CONSTRAINT "users_resetTokenHash_key" UNIQUE ("resetTokenHash");
  END IF;
END $$;

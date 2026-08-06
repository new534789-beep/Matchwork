-- Classification IA par domaine (droit, maths-info, santé...) — voir
-- lib/domaines.ts et lib/ia/classification-domaines.ts. IF NOT EXISTS rend
-- cette migration idempotente (déjà appliquée en dev via `db push`).
ALTER TABLE "opportunites" ADD COLUMN IF NOT EXISTS "domaines" TEXT NOT NULL DEFAULT '[]';

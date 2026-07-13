-- AlterTable: ajout code parrainage sur users
ALTER TABLE "users" ADD COLUMN "codeParrainage" TEXT;
CREATE UNIQUE INDEX "users_codeParrainage_key" ON "users"("codeParrainage");

-- CreateTable: push_subscriptions
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: parrainages
CREATE TABLE "parrainages" (
    "id" TEXT NOT NULL,
    "parrainId" TEXT NOT NULL,
    "filleulId" TEXT,
    "code" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'en_attente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parrainages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "parrainages_code_key" ON "parrainages"("code");
CREATE INDEX "parrainages_parrainId_idx" ON "parrainages"("parrainId");
ALTER TABLE "parrainages" ADD CONSTRAINT "parrainages_parrainId_fkey" FOREIGN KEY ("parrainId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "parrainages" ADD CONSTRAINT "parrainages_filleulId_fkey" FOREIGN KEY ("filleulId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: organismes
CREATE TABLE "organismes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'universite',
    "pays" TEXT,
    "siteWeb" TEXT,
    "logo" TEXT,
    "verifie" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organismes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organismes_userId_key" ON "organismes"("userId");
ALTER TABLE "organismes" ADD CONSTRAINT "organismes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `utilisations` on the `quota_usage` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "fournisseur" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'en_attente',
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "paiements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_quota_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mois" TEXT NOT NULL,
    "generationsUtilisees" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "quota_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_quota_usage" ("id", "mois", "userId") SELECT "id", "mois", "userId" FROM "quota_usage";
DROP TABLE "quota_usage";
ALTER TABLE "new_quota_usage" RENAME TO "quota_usage";
CREATE UNIQUE INDEX "quota_usage_userId_mois_key" ON "quota_usage"("userId", "mois");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'gratuit',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "id", "motDePasse", "plan", "updatedAt") SELECT "createdAt", "email", "id", "motDePasse", "plan", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

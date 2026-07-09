-- AlterTable: add briefProjet to dossiers
ALTER TABLE "dossiers" ADD COLUMN "briefProjet" TEXT;

-- CreateTable: journal_admin
CREATE TABLE "journal_admin" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "cible" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_admin_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "journal_admin_adminId_idx" ON "journal_admin"("adminId");
CREATE INDEX "journal_admin_createdAt_idx" ON "journal_admin"("createdAt");

-- CreateTable: session_activities
CREATE TABLE "session_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "debutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dureeMs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "session_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_activities_userId_idx" ON "session_activities"("userId");

-- CreateIndex
CREATE INDEX "session_activities_debutAt_idx" ON "session_activities"("debutAt");

-- AddForeignKey
ALTER TABLE "session_activities" ADD CONSTRAINT "session_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

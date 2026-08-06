-- CreateTable
CREATE TABLE "cache_ia" (
    "cle" TEXT NOT NULL,
    "tache" TEXT NOT NULL,
    "reponse" TEXT NOT NULL,
    "fournisseur" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cache_ia_pkey" PRIMARY KEY ("cle")
);

-- CreateIndex
CREATE INDEX "cache_ia_tache_idx" ON "cache_ia"("tache");

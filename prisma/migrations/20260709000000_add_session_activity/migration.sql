-- CreateTable
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

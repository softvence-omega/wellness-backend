-- CreateTable
CREATE TABLE "HealthScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "health_score" INTEGER,
    "analysis" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthScore_userId_idx" ON "HealthScore"("userId");

-- CreateIndex
CREATE INDEX "HealthScore_date_idx" ON "HealthScore"("date");

-- AddForeignKey
ALTER TABLE "HealthScore" ADD CONSTRAINT "HealthScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

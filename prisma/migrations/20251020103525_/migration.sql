/*
  Warnings:

  - You are about to drop the column `vitalId` on the `AdditionalMetrics` table. All the data in the column will be lost.
  - You are about to drop the `HeartRate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sleep` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Step` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VitalSigns` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AdditionalMetrics" DROP CONSTRAINT "AdditionalMetrics_vitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HeartRate" DROP CONSTRAINT "HeartRate_vitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Sleep" DROP CONSTRAINT "Sleep_vitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Step" DROP CONSTRAINT "Step_vitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VitalSigns" DROP CONSTRAINT "VitalSigns_userId_fkey";

-- DropIndex
DROP INDEX "public"."AdditionalMetrics_vitalId_idx";

-- DropIndex
DROP INDEX "public"."AdditionalMetrics_vitalId_key";

-- AlterTable
ALTER TABLE "public"."AdditionalMetrics" DROP COLUMN "vitalId";

-- DropTable
DROP TABLE "public"."HeartRate";

-- DropTable
DROP TABLE "public"."Sleep";

-- DropTable
DROP TABLE "public"."Step";

-- DropTable
DROP TABLE "public"."VitalSigns";

-- CreateTable
CREATE TABLE "public"."HealthData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "steps" INTEGER,
    "heartRate" DOUBLE PRECISION,
    "activeCalories" DOUBLE PRECISION,
    "fetchTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SleepData" (
    "id" TEXT NOT NULL,
    "healthDataId" TEXT NOT NULL,
    "deepMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lightMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sampleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SleepData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthData_userId_idx" ON "public"."HealthData"("userId");

-- CreateIndex
CREATE INDEX "HealthData_fetchTime_idx" ON "public"."HealthData"("fetchTime");

-- CreateIndex
CREATE INDEX "HealthData_createdAt_idx" ON "public"."HealthData"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HealthData_userId_fetchTime_key" ON "public"."HealthData"("userId", "fetchTime");

-- CreateIndex
CREATE UNIQUE INDEX "SleepData_healthDataId_key" ON "public"."SleepData"("healthDataId");

-- CreateIndex
CREATE INDEX "SleepData_healthDataId_idx" ON "public"."SleepData"("healthDataId");

-- AddForeignKey
ALTER TABLE "public"."HealthData" ADD CONSTRAINT "HealthData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SleepData" ADD CONSTRAINT "SleepData_healthDataId_fkey" FOREIGN KEY ("healthDataId") REFERENCES "public"."HealthData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

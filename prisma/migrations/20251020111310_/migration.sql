/*
  Warnings:

  - You are about to drop the column `sampleCount` on the `SleepData` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,startTime,endTime,dataSource]` on the table `HealthData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endTime` to the `HealthData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `HealthData` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DataQuality" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."WorkoutType" AS ENUM ('WALKING', 'RUNNING', 'CYCLING', 'SWIMMING', 'HIKING', 'YOGA', 'STRENGTH_TRAINING', 'HIGH_INTENSITY_INTERVAL_TRAINING', 'DANCE', 'FUNCTIONAL_STRENGTH_TRAINING', 'TRADITIONAL_STRENGTH_TRAINING', 'CARDIO', 'MIXED_CARDIO', 'OTHER');

-- DropIndex
DROP INDEX "public"."HealthData_createdAt_idx";

-- DropIndex
DROP INDEX "public"."HealthData_userId_fetchTime_key";

-- AlterTable
ALTER TABLE "public"."HealthData" ADD COLUMN     "dataQuality" "public"."DataQuality" NOT NULL DEFAULT 'GOOD',
ADD COLUMN     "dataSource" TEXT,
ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "heartRateVariability" DOUBLE PRECISION,
ADD COLUMN     "isManualEntry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "restingHeartRate" DOUBLE PRECISION,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "syncSessionId" TEXT;

-- AlterTable
ALTER TABLE "public"."SleepData" DROP COLUMN "sampleCount",
ADD COLUMN     "awakeMinutes" DOUBLE PRECISION,
ADD COLUMN     "bedtimeEnd" TIMESTAMP(3),
ADD COLUMN     "bedtimeStart" TIMESTAMP(3),
ADD COLUMN     "consistency" DOUBLE PRECISION,
ADD COLUMN     "coreMinutes" DOUBLE PRECISION,
ADD COLUMN     "sleepEfficiency" DOUBLE PRECISION,
ADD COLUMN     "sleepLatency" DOUBLE PRECISION,
ADD COLUMN     "timeInBed" DOUBLE PRECISION,
ALTER COLUMN "deepMinutes" DROP NOT NULL,
ALTER COLUMN "deepMinutes" DROP DEFAULT,
ALTER COLUMN "lightMinutes" DROP NOT NULL,
ALTER COLUMN "lightMinutes" DROP DEFAULT,
ALTER COLUMN "remMinutes" DROP NOT NULL,
ALTER COLUMN "remMinutes" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."WorkoutData" (
    "id" TEXT NOT NULL,
    "healthDataId" TEXT NOT NULL,
    "workoutType" "public"."WorkoutType",
    "duration" DOUBLE PRECISION,
    "totalDistance" DOUBLE PRECISION,
    "totalEnergy" DOUBLE PRECISION,
    "avgHeartRate" DOUBLE PRECISION,
    "maxHeartRate" DOUBLE PRECISION,
    "minHeartRate" DOUBLE PRECISION,
    "elevation" DOUBLE PRECISION,
    "routeData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutData_healthDataId_key" ON "public"."WorkoutData"("healthDataId");

-- CreateIndex
CREATE INDEX "WorkoutData_healthDataId_idx" ON "public"."WorkoutData"("healthDataId");

-- CreateIndex
CREATE INDEX "HealthData_startTime_idx" ON "public"."HealthData"("startTime");

-- CreateIndex
CREATE INDEX "HealthData_endTime_idx" ON "public"."HealthData"("endTime");

-- CreateIndex
CREATE INDEX "HealthData_dataSource_idx" ON "public"."HealthData"("dataSource");

-- CreateIndex
CREATE UNIQUE INDEX "HealthData_userId_startTime_endTime_dataSource_key" ON "public"."HealthData"("userId", "startTime", "endTime", "dataSource");

-- AddForeignKey
ALTER TABLE "public"."WorkoutData" ADD CONSTRAINT "WorkoutData_healthDataId_fkey" FOREIGN KEY ("healthDataId") REFERENCES "public"."HealthData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

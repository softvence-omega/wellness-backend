/*
  Warnings:

  - Added the required column `category` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('SYSTEM_ALERTS', 'PERSONALIZED_NUDGES', 'WELLNESS_NUDGES');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "category" "NotificationCategory" NOT NULL;

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "doNotDisturb" BOOLEAN NOT NULL DEFAULT false,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "personalizedNudges" BOOLEAN NOT NULL DEFAULT true,
    "wellnessNudges" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");

-- CreateIndex
CREATE INDEX "NotificationSettings_userId_idx" ON "NotificationSettings"("userId");

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

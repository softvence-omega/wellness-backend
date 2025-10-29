/*
  Warnings:

  - You are about to drop the column `activityReminders` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `doNotDisturb` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `doNotDisturbEnd` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `doNotDisturbStart` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `mealTracking` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `motivationalNudges` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `personalizedTips` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `progressUpdates` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `sleepInsights` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `systemAlerts` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `waterIntake` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `wellnessTips` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `body` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropIndex
DROP INDEX "public"."Notification_userId_idx";

-- DropIndex
DROP INDEX "public"."Notification_userId_key";

-- AlterTable
ALTER TABLE "Meal" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "mealType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "activityReminders",
DROP COLUMN "doNotDisturb",
DROP COLUMN "doNotDisturbEnd",
DROP COLUMN "doNotDisturbStart",
DROP COLUMN "mealTracking",
DROP COLUMN "motivationalNudges",
DROP COLUMN "personalizedTips",
DROP COLUMN "progressUpdates",
DROP COLUMN "sleepInsights",
DROP COLUMN "systemAlerts",
DROP COLUMN "updatedAt",
DROP COLUMN "waterIntake",
DROP COLUMN "wellnessTips",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

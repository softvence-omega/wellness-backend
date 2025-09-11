/*
  Warnings:

  - You are about to drop the column `amount` on the `Nudge` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Nudge` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Nudge` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `Nudge` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."NudgeCategory" AS ENUM ('HYDRATION', 'SLEEP', 'MOVEMENT', 'WEIGHT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Nudge" DROP COLUMN "amount",
DROP COLUMN "time",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "targetAmount" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "public"."NudgeCategory" NOT NULL,
ALTER COLUMN "unit" DROP NOT NULL,
ALTER COLUMN "schedule" DROP NOT NULL;

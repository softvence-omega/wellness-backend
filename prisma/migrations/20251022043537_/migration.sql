/*
  Warnings:

  - The `unit` column on the `Nudge` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."NudgeUnit" AS ENUM ('ML', 'LITERS', 'HOURS', 'MINUTES', 'STEPS', 'KILOMETERS', 'MILES', 'KG', 'POUNDS', 'CALORIES');

-- AlterTable
ALTER TABLE "public"."Nudge" DROP COLUMN "unit",
ADD COLUMN     "unit" "public"."NudgeUnit";

-- AlterTable
ALTER TABLE "public"."Tip" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

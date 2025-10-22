-- AlterTable
ALTER TABLE "public"."Nudge" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "remainingAmount" DOUBLE PRECISION;

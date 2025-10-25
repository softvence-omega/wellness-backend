-- AlterTable
ALTER TABLE "Nudge" ADD COLUMN     "isWeightImpact" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weightImpact" DOUBLE PRECISION;

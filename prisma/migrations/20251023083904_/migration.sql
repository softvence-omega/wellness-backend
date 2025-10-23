/*
  Warnings:

  - You are about to drop the column `photo` on the `LabReport` table. All the data in the column will be lost.
  - Added the required column `reportFile` to the `LabReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Tip" DROP CONSTRAINT "Tip_labReportId_fkey";

-- AlterTable
ALTER TABLE "LabReport" DROP COLUMN "photo",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reportFile" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "medical_reports" ALTER COLUMN "report_type" DROP NOT NULL,
ALTER COLUMN "patient_name" DROP NOT NULL,
ALTER COLUMN "report_date" DROP NOT NULL,
ALTER COLUMN "report_data" DROP NOT NULL;

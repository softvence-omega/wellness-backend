-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('CBC', 'LFT', 'KFT', 'THYROID', 'MRI', 'CT_SCAN', 'X_RAY', 'ULTRASOUND', 'ECG', 'BLOOD_TEST', 'URINE_TEST', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Tip" ADD COLUMN     "medicalReportId" TEXT;

-- CreateTable
CREATE TABLE "public"."medical_reports" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "report_type" "public"."ReportType" NOT NULL,
    "patient_name" TEXT NOT NULL,
    "report_date" TIMESTAMP(3) NOT NULL,
    "lab_name" TEXT,
    "doctor_name" TEXT,
    "report_data" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medical_reports_file_name_key" ON "public"."medical_reports"("file_name");

-- CreateIndex
CREATE INDEX "medical_reports_userId_idx" ON "public"."medical_reports"("userId");

-- CreateIndex
CREATE INDEX "medical_reports_patient_name_idx" ON "public"."medical_reports"("patient_name");

-- CreateIndex
CREATE INDEX "medical_reports_report_type_idx" ON "public"."medical_reports"("report_type");

-- CreateIndex
CREATE INDEX "medical_reports_report_date_idx" ON "public"."medical_reports"("report_date");

-- AddForeignKey
ALTER TABLE "public"."medical_reports" ADD CONSTRAINT "medical_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tip" ADD CONSTRAINT "Tip_medicalReportId_fkey" FOREIGN KEY ("medicalReportId") REFERENCES "public"."medical_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

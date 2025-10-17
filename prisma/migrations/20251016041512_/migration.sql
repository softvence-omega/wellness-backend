/*
  Warnings:

  - The primary key for the `AdditionalMetrics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Conversation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DeviceIntegration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `HeartRate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LabReport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Meal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Nudge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Sleep` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Step` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Tip` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VitalSigns` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."AdditionalMetrics" DROP CONSTRAINT "AdditionalMetrics_vitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Conversation" DROP CONSTRAINT "Conversation_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DeviceIntegration" DROP CONSTRAINT "DeviceIntegration_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HeartRate" DROP CONSTRAINT "HeartRate_vitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LabReport" DROP CONSTRAINT "LabReport_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Meal" DROP CONSTRAINT "Meal_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Nudge" DROP CONSTRAINT "Nudge_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Sleep" DROP CONSTRAINT "Sleep_vitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Step" DROP CONSTRAINT "Step_vitalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Tip" DROP CONSTRAINT "Tip_labReportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Tip" DROP CONSTRAINT "Tip_nudgesId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Tip" DROP CONSTRAINT "Tip_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VitalSigns" DROP CONSTRAINT "VitalSigns_userId_fkey";

-- AlterTable
ALTER TABLE "public"."AdditionalMetrics" DROP CONSTRAINT "AdditionalMetrics_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "vitalId" SET DATA TYPE TEXT,
ADD CONSTRAINT "AdditionalMetrics_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AdditionalMetrics_id_seq";

-- AlterTable
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "conversationId" SET DATA TYPE TEXT,
ALTER COLUMN "senderId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Chat_id_seq";

-- AlterTable
ALTER TABLE "public"."Conversation" DROP CONSTRAINT "Conversation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Conversation_id_seq";

-- AlterTable
ALTER TABLE "public"."DeviceIntegration" DROP CONSTRAINT "DeviceIntegration_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "DeviceIntegration_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DeviceIntegration_id_seq";

-- AlterTable
ALTER TABLE "public"."HeartRate" DROP CONSTRAINT "HeartRate_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "vitalId" SET DATA TYPE TEXT,
ADD CONSTRAINT "HeartRate_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "HeartRate_id_seq";

-- AlterTable
ALTER TABLE "public"."LabReport" DROP CONSTRAINT "LabReport_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "LabReport_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LabReport_id_seq";

-- AlterTable
ALTER TABLE "public"."Meal" DROP CONSTRAINT "Meal_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Meal_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Meal_id_seq";

-- AlterTable
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Notification_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Notification_id_seq";

-- AlterTable
ALTER TABLE "public"."Nudge" DROP CONSTRAINT "Nudge_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Nudge_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Nudge_id_seq";

-- AlterTable
ALTER TABLE "public"."Profile" DROP CONSTRAINT "Profile_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Profile_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Profile_id_seq";

-- AlterTable
ALTER TABLE "public"."Sleep" DROP CONSTRAINT "Sleep_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "vitalId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Sleep_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Sleep_id_seq";

-- AlterTable
ALTER TABLE "public"."Step" DROP CONSTRAINT "Step_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "vitalId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Step_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Step_id_seq";

-- AlterTable
ALTER TABLE "public"."Tip" DROP CONSTRAINT "Tip_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "labReportId" SET DATA TYPE TEXT,
ALTER COLUMN "nudgesId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Tip_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Tip_id_seq";

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "public"."VitalSigns" DROP CONSTRAINT "VitalSigns_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "VitalSigns_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "VitalSigns_id_seq";

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeviceIntegration" ADD CONSTRAINT "DeviceIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Nudge" ADD CONSTRAINT "Nudge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VitalSigns" ADD CONSTRAINT "VitalSigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HeartRate" ADD CONSTRAINT "HeartRate_vitalId_fkey" FOREIGN KEY ("vitalId") REFERENCES "public"."VitalSigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Step" ADD CONSTRAINT "Step_vitalId_fkey" FOREIGN KEY ("vitalId") REFERENCES "public"."VitalSigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sleep" ADD CONSTRAINT "Sleep_vitalId_fkey" FOREIGN KEY ("vitalId") REFERENCES "public"."VitalSigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdditionalMetrics" ADD CONSTRAINT "AdditionalMetrics_vitalId_fkey" FOREIGN KEY ("vitalId") REFERENCES "public"."VitalSigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meal" ADD CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabReport" ADD CONSTRAINT "LabReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tip" ADD CONSTRAINT "Tip_labReportId_fkey" FOREIGN KEY ("labReportId") REFERENCES "public"."LabReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tip" ADD CONSTRAINT "Tip_nudgesId_fkey" FOREIGN KEY ("nudgesId") REFERENCES "public"."Nudge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tip" ADD CONSTRAINT "Tip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

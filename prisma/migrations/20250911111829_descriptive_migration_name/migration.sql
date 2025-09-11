-- CreateEnum
CREATE TYPE "public"."Language" AS ENUM ('EN', 'BN');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."HealthGoal" AS ENUM ('LOSE_WEIGHT', 'BUILD_MUSCLE', 'MAINTAIN_HEALTH', 'IMPROVE');

-- CreateEnum
CREATE TYPE "public"."TipType" AS ENUM ('LAB_REPORT', 'NUDGES');

-- CreateEnum
CREATE TYPE "public"."RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."NudgeCategory" AS ENUM ('HYDRATION', 'SLEEP', 'MOVEMENT', 'WEIGHT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "fitbitAccessToken" TEXT,
    "fitbitRefreshToken" TEXT,
    "fitbitAccessTokenExpiry" TIMESTAMP(3),
    "isAgreeTerms" BOOLEAN DEFAULT false,
    "otp" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "changePasswordAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "photo" TEXT,
    "fullName" TEXT,
    "isEnableNotification" BOOLEAN DEFAULT false,
    "language" "public"."Language" DEFAULT 'EN',
    "dateOfBirth" TIMESTAMP(3),
    "gender" "public"."Gender",
    "height" TEXT,
    "weight" TEXT,
    "healthGoal" "public"."HealthGoal",

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "activityReminders" BOOLEAN NOT NULL DEFAULT false,
    "mealTracking" BOOLEAN NOT NULL DEFAULT false,
    "sleepInsights" BOOLEAN NOT NULL DEFAULT false,
    "progressUpdates" BOOLEAN NOT NULL DEFAULT false,
    "waterIntake" BOOLEAN NOT NULL DEFAULT false,
    "motivationalNudges" BOOLEAN NOT NULL DEFAULT false,
    "wellnessTips" BOOLEAN NOT NULL DEFAULT false,
    "personalizedTips" BOOLEAN NOT NULL DEFAULT false,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT false,
    "doNotDisturb" BOOLEAN NOT NULL DEFAULT false,
    "doNotDisturbStart" TIMESTAMP(3),
    "doNotDisturbEnd" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeviceIntegration" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "appleHealth_isConnected" BOOLEAN NOT NULL DEFAULT false,
    "appleHealth_lastSync" TIMESTAMP(3),
    "googleFit_isConnected" BOOLEAN NOT NULL DEFAULT false,
    "googleFit_lastSync" TIMESTAMP(3),
    "fitbit_isConnected" BOOLEAN NOT NULL DEFAULT false,
    "fitbit_lastSync" TIMESTAMP(3),
    "strava_isConnected" BOOLEAN NOT NULL DEFAULT false,
    "strava_lastSync" TIMESTAMP(3),
    "auto_sync" TIMESTAMP(3),

    CONSTRAINT "DeviceIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Nudge" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" "public"."NudgeCategory" NOT NULL,
    "targetAmount" DOUBLE PRECISION,
    "unit" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Nudge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VitalSigns" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dataFrom" TEXT NOT NULL,

    CONSTRAINT "VitalSigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HeartRate" (
    "id" SERIAL NOT NULL,
    "vitalId" INTEGER NOT NULL,
    "heartRate" INTEGER,
    "heartRateLastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "resting" TEXT,
    "average" TEXT,
    "peak" TEXT,
    "message" TEXT,

    CONSTRAINT "HeartRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Step" (
    "id" SERIAL NOT NULL,
    "vitalId" INTEGER NOT NULL,
    "stepsCount" INTEGER NOT NULL,
    "distance" INTEGER NOT NULL,
    "calories" INTEGER NOT NULL,
    "activeMin" INTEGER NOT NULL,
    "message" TEXT,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sleep" (
    "id" SERIAL NOT NULL,
    "vitalId" INTEGER NOT NULL,
    "sleepStartAt" TIMESTAMP(3) NOT NULL,
    "sleepEndAt" TIMESTAMP(3) NOT NULL,
    "deep" TEXT,
    "rem" TEXT,
    "light" TEXT,
    "message" TEXT,

    CONSTRAINT "Sleep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdditionalMetrics" (
    "id" SERIAL NOT NULL,
    "vitalId" INTEGER NOT NULL,
    "heartRateVariability" INTEGER NOT NULL,
    "bodyTemp" INTEGER NOT NULL,
    "respiratoryRate" INTEGER NOT NULL,

    CONSTRAINT "AdditionalMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Meal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "photo" TEXT,
    "name" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "note" TEXT,
    "calories" TEXT,
    "protein" TEXT,
    "carbs" TEXT,
    "fats" TEXT,
    "time" TEXT,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabReport" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "photo" TEXT,

    CONSTRAINT "LabReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tip" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "labReportId" INTEGER,
    "nudgesId" INTEGER,
    "type" "public"."TipType" NOT NULL,
    "message" TEXT NOT NULL,
    "riskLevel" "public"."RiskLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chat" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "type" "public"."MessageType" NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_key" ON "public"."Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceIntegration_userId_key" ON "public"."DeviceIntegration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VitalSigns_userId_key" ON "public"."VitalSigns"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HeartRate_vitalId_key" ON "public"."HeartRate"("vitalId");

-- CreateIndex
CREATE UNIQUE INDEX "Step_vitalId_key" ON "public"."Step"("vitalId");

-- CreateIndex
CREATE UNIQUE INDEX "Sleep_vitalId_key" ON "public"."Sleep"("vitalId");

-- CreateIndex
CREATE UNIQUE INDEX "AdditionalMetrics_vitalId_key" ON "public"."AdditionalMetrics"("vitalId");

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

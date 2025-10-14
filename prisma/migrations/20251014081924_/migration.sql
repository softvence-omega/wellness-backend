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
    "refreshToken" TEXT,
    "fitbitAccessToken" TEXT,
    "fitbitRefreshToken" TEXT,
    "fitbitAccessTokenExpiry" TIMESTAMP(3),
    "stravaAccessToken" TEXT,
    "stravaRefreshToken" TEXT,
    "stravaAccessTokenExpiry" TIMESTAMP(3),
    "isAgreeTerms" BOOLEAN NOT NULL DEFAULT false,
    "otp" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "changePasswordAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "photo" TEXT,
    "fullName" TEXT,
    "isEnableNotification" BOOLEAN NOT NULL DEFAULT false,
    "language" "public"."Language" NOT NULL DEFAULT 'EN',
    "dateOfBirth" TIMESTAMP(3),
    "gender" "public"."Gender",
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "healthGoal" "public"."HealthGoal",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Nudge" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" "public"."NudgeCategory" NOT NULL,
    "targetAmount" DOUBLE PRECISION,
    "consumedAmount" DOUBLE PRECISION,
    "unit" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resting" INTEGER,
    "average" INTEGER,
    "peak" INTEGER,
    "message" JSONB,

    CONSTRAINT "HeartRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Step" (
    "id" SERIAL NOT NULL,
    "vitalId" INTEGER NOT NULL,
    "stepsCount" INTEGER NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "activeMin" INTEGER NOT NULL,
    "message" JSONB,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sleep" (
    "id" SERIAL NOT NULL,
    "vitalId" INTEGER NOT NULL,
    "sleepStartAt" TIMESTAMP(3) NOT NULL,
    "sleepEndAt" TIMESTAMP(3) NOT NULL,
    "deep" DOUBLE PRECISION,
    "rem" DOUBLE PRECISION,
    "light" DOUBLE PRECISION,
    "message" JSONB,

    CONSTRAINT "Sleep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdditionalMetrics" (
    "id" SERIAL NOT NULL,
    "vitalId" INTEGER NOT NULL,
    "heartRateVariability" INTEGER NOT NULL,
    "bodyTemp" DOUBLE PRECISION NOT NULL,
    "respiratoryRate" INTEGER NOT NULL,

    CONSTRAINT "AdditionalMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Meal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "photo" TEXT,
    "name" TEXT NOT NULL,
    "mealType" "public"."MealType" NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "calories" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fats" DOUBLE PRECISION,
    "time" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_userId_idx" ON "public"."Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_key" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceIntegration_userId_key" ON "public"."DeviceIntegration"("userId");

-- CreateIndex
CREATE INDEX "DeviceIntegration_userId_idx" ON "public"."DeviceIntegration"("userId");

-- CreateIndex
CREATE INDEX "Nudge_userId_category_idx" ON "public"."Nudge"("userId", "category");

-- CreateIndex
CREATE INDEX "Nudge_date_idx" ON "public"."Nudge"("date");

-- CreateIndex
CREATE UNIQUE INDEX "VitalSigns_userId_key" ON "public"."VitalSigns"("userId");

-- CreateIndex
CREATE INDEX "VitalSigns_userId_idx" ON "public"."VitalSigns"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HeartRate_vitalId_key" ON "public"."HeartRate"("vitalId");

-- CreateIndex
CREATE INDEX "HeartRate_vitalId_idx" ON "public"."HeartRate"("vitalId");

-- CreateIndex
CREATE UNIQUE INDEX "Step_vitalId_key" ON "public"."Step"("vitalId");

-- CreateIndex
CREATE INDEX "Step_vitalId_idx" ON "public"."Step"("vitalId");

-- CreateIndex
CREATE UNIQUE INDEX "Sleep_vitalId_key" ON "public"."Sleep"("vitalId");

-- CreateIndex
CREATE INDEX "Sleep_vitalId_idx" ON "public"."Sleep"("vitalId");

-- CreateIndex
CREATE UNIQUE INDEX "AdditionalMetrics_vitalId_key" ON "public"."AdditionalMetrics"("vitalId");

-- CreateIndex
CREATE INDEX "AdditionalMetrics_vitalId_idx" ON "public"."AdditionalMetrics"("vitalId");

-- CreateIndex
CREATE INDEX "Meal_userId_mealType_idx" ON "public"."Meal"("userId", "mealType");

-- CreateIndex
CREATE INDEX "Meal_createdAt_idx" ON "public"."Meal"("createdAt");

-- CreateIndex
CREATE INDEX "LabReport_userId_idx" ON "public"."LabReport"("userId");

-- CreateIndex
CREATE INDEX "Tip_userId_idx" ON "public"."Tip"("userId");

-- CreateIndex
CREATE INDEX "Tip_labReportId_idx" ON "public"."Tip"("labReportId");

-- CreateIndex
CREATE INDEX "Tip_nudgesId_idx" ON "public"."Tip"("nudgesId");

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "public"."Conversation"("userId");

-- CreateIndex
CREATE INDEX "Conversation_createdAt_idx" ON "public"."Conversation"("createdAt");

-- CreateIndex
CREATE INDEX "Chat_conversationId_idx" ON "public"."Chat"("conversationId");

-- CreateIndex
CREATE INDEX "Chat_createdAt_idx" ON "public"."Chat"("createdAt");

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

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "doNotDisturb" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "fitbitAccessToken" TEXT,
ADD COLUMN     "fitbitRefreshToken" TEXT;

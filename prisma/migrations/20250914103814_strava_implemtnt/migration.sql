-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "stravaAccessToken" TEXT,
ADD COLUMN     "stravaAccessTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "stravaRefreshToken" TEXT;

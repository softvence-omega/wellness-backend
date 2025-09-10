/*
  Warnings:

  - You are about to drop the column `isEnableNotification` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Profile" ADD COLUMN     "isEnableNotification" BOOLEAN DEFAULT false,
ADD COLUMN     "language" "public"."Language" DEFAULT 'EN';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "isEnableNotification",
DROP COLUMN "language";

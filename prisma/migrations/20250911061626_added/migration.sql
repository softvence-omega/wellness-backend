/*
  Warnings:

  - Changed the type of `type` on the `Chat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Chat" DROP COLUMN "type",
ADD COLUMN     "type" "public"."MessageType" NOT NULL;

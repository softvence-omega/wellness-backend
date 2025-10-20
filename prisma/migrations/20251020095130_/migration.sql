/*
  Warnings:

  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "gender";

-- CreateTable
CREATE TABLE "public"."EmotionEntry" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "note" TEXT,
    "intensity" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmotionEntry_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE INDEX "EmotionEntry_userId_idx" ON "public"."EmotionEntry"("userId");

-- CreateIndex
CREATE INDEX "EmotionEntry_createdAt_idx" ON "public"."EmotionEntry"("createdAt");

-- CreateIndex
CREATE INDEX "EmotionEntry_emoji_idx" ON "public"."EmotionEntry"("emoji");

-- AddForeignKey
ALTER TABLE "public"."EmotionEntry" ADD CONSTRAINT "EmotionEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

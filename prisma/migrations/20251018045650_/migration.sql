/*
  Warnings:

  - You are about to drop the column `descriptions` on the `Meal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Meal" DROP COLUMN "descriptions",
ADD COLUMN     "description" TEXT;

/*
  Warnings:

  - The values [MEDITATION,STRETCHING,MINDFULNESS] on the enum `NudgeCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NudgeCategory_new" AS ENUM ('HYDRATION', 'SLEEP', 'MOVEMENT', 'WEIGHT', 'BREATHING', 'OTHER');
ALTER TABLE "Nudge" ALTER COLUMN "category" TYPE "NudgeCategory_new" USING ("category"::text::"NudgeCategory_new");
ALTER TYPE "NudgeCategory" RENAME TO "NudgeCategory_old";
ALTER TYPE "NudgeCategory_new" RENAME TO "NudgeCategory";
DROP TYPE "public"."NudgeCategory_old";
COMMIT;

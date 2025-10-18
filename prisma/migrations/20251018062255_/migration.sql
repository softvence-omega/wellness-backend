-- AlterTable
ALTER TABLE "public"."Step" ALTER COLUMN "distance" DROP NOT NULL,
ALTER COLUMN "calories" DROP NOT NULL,
ALTER COLUMN "activeMin" DROP NOT NULL;

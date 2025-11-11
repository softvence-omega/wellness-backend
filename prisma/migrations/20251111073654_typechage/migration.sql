/*
  Warnings:

  - You are about to alter the column `value` on the `Movement` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `endDate` on the `Sleep` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Sleep` table. All the data in the column will be lost.
  - You are about to alter the column `hours` on the `Sleep` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `value` on the `Weight` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `count` to the `Hydration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hours` to the `Hydration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `count` to the `Movement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hours` to the `Movement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `count` to the `Sleep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Sleep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Sleep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `count` to the `Weight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hours` to the `Weight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hydration" ADD COLUMN     "count" INTEGER NOT NULL,
ADD COLUMN     "hours" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Movement" ADD COLUMN     "count" INTEGER NOT NULL,
ADD COLUMN     "hours" INTEGER NOT NULL,
ALTER COLUMN "value" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Sleep" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "count" INTEGER NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL,
ALTER COLUMN "hours" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Weight" ADD COLUMN     "count" INTEGER NOT NULL,
ADD COLUMN     "hours" INTEGER NOT NULL,
ALTER COLUMN "value" SET DATA TYPE INTEGER;

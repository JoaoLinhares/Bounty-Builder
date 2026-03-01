/*
  Warnings:

  - You are about to drop the column `rarity` on the `Character` table. All the data in the column will be lost.
  - The `type` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isPowerGage` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `isTimeGated` on the `Skill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Character" DROP COLUMN "rarity",
ADD COLUMN     "colab" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selfStatusEffect" TEXT[],
DROP COLUMN "type",
ADD COLUMN     "type" TEXT[];

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "isPowerGage",
DROP COLUMN "isTimeGated",
ADD COLUMN     "type" TEXT[];

-- DropEnum
DROP TYPE "Rarity";

-- DropEnum
DROP TYPE "Type";

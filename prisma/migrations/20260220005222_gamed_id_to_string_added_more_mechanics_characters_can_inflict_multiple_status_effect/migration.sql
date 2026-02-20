/*
  Warnings:

  - The `inflictsStatusEffect` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Type" ADD VALUE 'TREASURE_AREA_EFFECT';
ALTER TYPE "Type" ADD VALUE 'CREATE_ENTITY';
ALTER TYPE "Type" ADD VALUE 'STATE';
ALTER TYPE "Type" ADD VALUE 'COUNTER';

-- AlterTable
ALTER TABLE "Character" ALTER COLUMN "gameId" SET DATA TYPE TEXT,
DROP COLUMN "inflictsStatusEffect",
ADD COLUMN     "inflictsStatusEffect" TEXT[];

-- AlterTable
ALTER TABLE "Medal" ALTER COLUMN "gameId" SET DATA TYPE TEXT;

/*
  Warnings:

  - The `sizeTraits` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `characterTraits` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `traits1` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `traits2` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `boostTrait` column on the `Character` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `stateTraits` column on the `CharacterState` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sizeTraits` column on the `CharacterState` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `Skill` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `effect` column on the `Skill` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Character" DROP COLUMN "sizeTraits",
ADD COLUMN     "sizeTraits" TEXT[],
DROP COLUMN "characterTraits",
ADD COLUMN     "characterTraits" TEXT[],
DROP COLUMN "traits1",
ADD COLUMN     "traits1" TEXT[],
DROP COLUMN "traits2",
ADD COLUMN     "traits2" TEXT[],
DROP COLUMN "boostTrait",
ADD COLUMN     "boostTrait" TEXT[];

-- AlterTable
ALTER TABLE "CharacterState" DROP COLUMN "stateTraits",
ADD COLUMN     "stateTraits" TEXT[],
DROP COLUMN "sizeTraits",
ADD COLUMN     "sizeTraits" TEXT[];

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "description",
ADD COLUMN     "description" TEXT[],
DROP COLUMN "effect",
ADD COLUMN     "effect" TEXT[];

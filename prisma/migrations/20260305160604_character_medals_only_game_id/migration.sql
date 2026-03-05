/*
  Warnings:

  - The primary key for the `Character` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Character` table. All the data in the column will be lost.
  - The primary key for the `Medal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Medal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CharacterState" DROP CONSTRAINT "CharacterState_characterId_fkey";

-- DropForeignKey
ALTER TABLE "CharacterTagRelation" DROP CONSTRAINT "CharacterTagRelation_characterId_fkey";

-- DropForeignKey
ALTER TABLE "Medal" DROP CONSTRAINT "Medal_characterId_fkey";

-- DropForeignKey
ALTER TABLE "MedalTagRelation" DROP CONSTRAINT "MedalTagRelation_medalId_fkey";

-- DropForeignKey
ALTER TABLE "UniqueTraitConstraintRelation" DROP CONSTRAINT "UniqueTraitConstraintRelation_medalId_fkey";

-- DropForeignKey
ALTER TABLE "UniqueTraitRelation" DROP CONSTRAINT "UniqueTraitRelation_medalId_fkey";

-- DropForeignKey
ALTER TABLE "UserCharacter" DROP CONSTRAINT "UserCharacter_characterId_fkey";

-- DropForeignKey
ALTER TABLE "UserMedal" DROP CONSTRAINT "UserMedal_medalId_fkey";

-- DropIndex
DROP INDEX "Character_gameId_key";

-- DropIndex
DROP INDEX "Medal_gameId_key";

-- AlterTable
ALTER TABLE "Character" DROP CONSTRAINT "Character_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Character_pkey" PRIMARY KEY ("gameId");

-- AlterTable
ALTER TABLE "Medal" DROP CONSTRAINT "Medal_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Medal_pkey" PRIMARY KEY ("gameId");

-- AddForeignKey
ALTER TABLE "UserCharacter" ADD CONSTRAINT "UserCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("gameId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMedal" ADD CONSTRAINT "UserMedal_medalId_fkey" FOREIGN KEY ("medalId") REFERENCES "Medal"("gameId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterState" ADD CONSTRAINT "CharacterState_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTagRelation" ADD CONSTRAINT "CharacterTagRelation_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medal" ADD CONSTRAINT "Medal_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("gameId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniqueTraitConstraintRelation" ADD CONSTRAINT "UniqueTraitConstraintRelation_medalId_fkey" FOREIGN KEY ("medalId") REFERENCES "Medal"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniqueTraitRelation" ADD CONSTRAINT "UniqueTraitRelation_medalId_fkey" FOREIGN KEY ("medalId") REFERENCES "Medal"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedalTagRelation" ADD CONSTRAINT "MedalTagRelation_medalId_fkey" FOREIGN KEY ("medalId") REFERENCES "Medal"("gameId") ON DELETE CASCADE ON UPDATE CASCADE;

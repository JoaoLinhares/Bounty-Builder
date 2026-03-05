/*
  Warnings:

  - The primary key for the `CharacterTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CharacterTag` table. All the data in the column will be lost.
  - The primary key for the `MedalTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MedalTag` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `UniqueTraitConstraint` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CharacterTagRelation" DROP CONSTRAINT "CharacterTagRelation_tagId_fkey";

-- DropForeignKey
ALTER TABLE "MedalTagRelation" DROP CONSTRAINT "MedalTagRelation_tagId_fkey";

-- DropIndex
DROP INDEX "CharacterTag_name_key";

-- DropIndex
DROP INDEX "MedalTag_name_key";

-- AlterTable
ALTER TABLE "CharacterTag" DROP CONSTRAINT "CharacterTag_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "CharacterTag_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "MedalTag" DROP CONSTRAINT "MedalTag_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "MedalTag_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "UniqueTraitConstraint" DROP COLUMN "tag",
ADD COLUMN     "tagId" TEXT;

-- AddForeignKey
ALTER TABLE "CharacterTagRelation" ADD CONSTRAINT "CharacterTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "CharacterTag"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniqueTraitConstraint" ADD CONSTRAINT "UniqueTraitConstraint_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "CharacterTag"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedalTagRelation" ADD CONSTRAINT "MedalTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "MedalTag"("name") ON DELETE CASCADE ON UPDATE CASCADE;

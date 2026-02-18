-- CreateEnum
CREATE TYPE "Element" AS ENUM ('RED', 'BLUE', 'GREEN', 'DARK', 'LIGHT');

-- CreateEnum
CREATE TYPE "Class" AS ENUM ('ATTACKER', 'DEFENDER', 'RUNNER');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('TRANSFORM', 'ELEMENT_CHANGE', 'CLASS_CHANGE', 'SKILL_TRANSFORM', 'CHARACTER_SWAP', 'STATUS_EFFECT', 'SHIELD', 'POWER_GAGE');

-- CreateEnum
CREATE TYPE "Size" AS ENUM ('NORMAL', 'SMALL', 'GIANT');

-- CreateEnum
CREATE TYPE "BaseGrade" AS ENUM ('TWO_STAR', 'THREE_STAR', 'FOUR_STAR');

-- CreateEnum
CREATE TYPE "FourStarType" AS ENUM ('STEP_UP', 'BOUNTY_FEST', 'EXTREME', 'COLA');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('FREE', 'LIMITED');

-- CreateEnum
CREATE TYPE "TeamBoost" AS ENUM ('ATTACK', 'EX_ATTACK', 'RECOVERY', 'EX_RECOVERY', 'SPD', 'EX_SPD');

-- CreateEnum
CREATE TYPE "MedalType" AS ENUM ('CHARACTER', 'CHARACTER_RANKING', 'EVENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCharacter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "levelCap" INTEGER NOT NULL,
    "currentBoost" INTEGER NOT NULL DEFAULT 0,
    "skill1Level" INTEGER NOT NULL DEFAULT 1,
    "skill2Level" INTEGER NOT NULL DEFAULT 1,
    "isOwned" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportCharacter" (
    "partyId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "SupportCharacter_pkey" PRIMARY KEY ("partyId","characterId")
);

-- CreateTable
CREATE TABLE "PlayableCharacter" (
    "partyId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "supportPercentage" INTEGER NOT NULL,

    CONSTRAINT "PlayableCharacter_pkey" PRIMARY KEY ("partyId","characterId")
);

-- CreateTable
CREATE TABLE "UserMedal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "medalId" TEXT NOT NULL,
    "isOwned" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserMedal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedalTrait" (
    "id" TEXT NOT NULL,
    "trait" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "constraint" TEXT,
    "slot" INTEGER NOT NULL,
    "medalId" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MedalTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedalSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MedalSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedalSetSlot" (
    "medalId" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "MedalSetSlot_pkey" PRIMARY KEY ("medalId","setId")
);

-- CreateTable
CREATE TABLE "MedalSetCharacter" (
    "medalSetId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "MedalSetCharacter_pkey" PRIMARY KEY ("medalSetId","characterId")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "charDescription" TEXT,
    "gameId" INTEGER NOT NULL,
    "nameId" TEXT NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL,
    "assetLarge" TEXT NOT NULL,
    "assetCard" TEXT NOT NULL,
    "type" "Type"[],
    "mainElement" "Element" NOT NULL,
    "mainClass" "Class" NOT NULL,
    "mainSize" "Size" NOT NULL DEFAULT 'NORMAL',
    "baseGrade" "BaseGrade" NOT NULL DEFAULT 'FOUR_STAR',
    "fourStarType" "FourStarType",
    "rarity" "Rarity",
    "teamBoost" "TeamBoost" NOT NULL,
    "bountyColours" TEXT[],
    "sizeTraits" JSONB,
    "characterTraits" JSONB NOT NULL,
    "traits1" JSONB NOT NULL,
    "traits2" JSONB NOT NULL,
    "boostTrait" JSONB NOT NULL,
    "inflictsStatusEffect" TEXT,
    "medalSetEvaluation" JSONB,
    "partySupportEvaluation" JSONB,
    "playStyleEvaluation" JSONB,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "name" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "description" JSONB NOT NULL,
    "effect" JSONB NOT NULL,
    "characterStateId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "skillTransform" BOOLEAN NOT NULL DEFAULT false,
    "cooldown" INTEGER NOT NULL,
    "isPowerGage" BOOLEAN NOT NULL DEFAULT false,
    "isTimeGated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterState" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "overrideBaseElement" "Element",
    "overrideBaseClass" "Class",
    "overrideBaseSize" "Size",
    "stateTraits" JSONB NOT NULL,
    "sizeTraits" JSONB,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "CharacterState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CharacterTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTagRelation" (
    "characterId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "CharacterTagRelation_pkey" PRIMARY KEY ("characterId","tagId")
);

-- CreateTable
CREATE TABLE "Medal" (
    "id" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MedalType" NOT NULL,
    "asset" TEXT NOT NULL,
    "uniqueTraitDescription" TEXT NOT NULL,
    "characterId" TEXT,

    CONSTRAINT "Medal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniqueTraitConstraint" (
    "description" TEXT NOT NULL,
    "constraint" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "tag" TEXT,
    "statusEffect" TEXT,

    CONSTRAINT "UniqueTraitConstraint_pkey" PRIMARY KEY ("description")
);

-- CreateTable
CREATE TABLE "UniqueTraitConstraintRelation" (
    "medalId" TEXT NOT NULL,
    "constraintId" TEXT NOT NULL,

    CONSTRAINT "UniqueTraitConstraintRelation_pkey" PRIMARY KEY ("medalId","constraintId")
);

-- CreateTable
CREATE TABLE "UniqueTrait" (
    "description" TEXT NOT NULL,
    "trait" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "time" INTEGER,

    CONSTRAINT "UniqueTrait_pkey" PRIMARY KEY ("description")
);

-- CreateTable
CREATE TABLE "UniqueTraitRelation" (
    "medalId" TEXT NOT NULL,
    "uniqueTraitId" TEXT NOT NULL,

    CONSTRAINT "UniqueTraitRelation_pkey" PRIMARY KEY ("medalId","uniqueTraitId")
);

-- CreateTable
CREATE TABLE "MedalTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MedalTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedalTagRelation" (
    "medalId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "MedalTagRelation_pkey" PRIMARY KEY ("medalId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "UserCharacter_userId_isOwned_idx" ON "UserCharacter"("userId", "isOwned");

-- CreateIndex
CREATE UNIQUE INDEX "UserCharacter_userId_characterId_key" ON "UserCharacter"("userId", "characterId");

-- CreateIndex
CREATE INDEX "Party_userId_isComplete_idx" ON "Party"("userId", "isComplete");

-- CreateIndex
CREATE UNIQUE INDEX "SupportCharacter_partyId_slot_key" ON "SupportCharacter"("partyId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "PlayableCharacter_partyId_slot_key" ON "PlayableCharacter"("partyId", "slot");

-- CreateIndex
CREATE INDEX "UserMedal_userId_isOwned_idx" ON "UserMedal"("userId", "isOwned");

-- CreateIndex
CREATE UNIQUE INDEX "MedalTrait_medalId_slot_key" ON "MedalTrait"("medalId", "slot");

-- CreateIndex
CREATE INDEX "MedalSet_userId_isComplete_idx" ON "MedalSet"("userId", "isComplete");

-- CreateIndex
CREATE UNIQUE INDEX "MedalSetSlot_setId_slot_key" ON "MedalSetSlot"("setId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "Character_gameId_key" ON "Character"("gameId");

-- CreateIndex
CREATE INDEX "Character_name_idx" ON "Character"("name");

-- CreateIndex
CREATE INDEX "Character_mainClass_idx" ON "Character"("mainClass");

-- CreateIndex
CREATE INDEX "Character_mainElement_idx" ON "Character"("mainElement");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_characterStateId_slot_skillTransform_key" ON "Skill"("characterStateId", "slot", "skillTransform");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterState_characterId_name_key" ON "CharacterState"("characterId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTag_name_key" ON "CharacterTag"("name");

-- CreateIndex
CREATE INDEX "CharacterTagRelation_tagId_idx" ON "CharacterTagRelation"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Medal_gameId_key" ON "Medal"("gameId");

-- CreateIndex
CREATE INDEX "Medal_type_idx" ON "Medal"("type");

-- CreateIndex
CREATE INDEX "UniqueTraitConstraintRelation_constraintId_idx" ON "UniqueTraitConstraintRelation"("constraintId");

-- CreateIndex
CREATE INDEX "UniqueTraitRelation_uniqueTraitId_idx" ON "UniqueTraitRelation"("uniqueTraitId");

-- CreateIndex
CREATE UNIQUE INDEX "MedalTag_name_key" ON "MedalTag"("name");

-- CreateIndex
CREATE INDEX "MedalTagRelation_tagId_idx" ON "MedalTagRelation"("tagId");

-- AddForeignKey
ALTER TABLE "UserCharacter" ADD CONSTRAINT "UserCharacter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCharacter" ADD CONSTRAINT "UserCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCharacter" ADD CONSTRAINT "SupportCharacter_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportCharacter" ADD CONSTRAINT "SupportCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "UserCharacter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayableCharacter" ADD CONSTRAINT "PlayableCharacter_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayableCharacter" ADD CONSTRAINT "PlayableCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "UserCharacter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMedal" ADD CONSTRAINT "UserMedal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMedal" ADD CONSTRAINT "UserMedal_medalId_fkey" FOREIGN KEY ("medalId") REFERENCES "Medal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedalTrait" ADD CONSTRAINT "MedalTrait_medalId_fkey" FOREIGN KEY ("medalId") REFERENCES "UserMedal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedalSet" ADD CONSTRAINT "MedalSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedalSetSlot" ADD CONSTRAINT "MedalSetSlot_medalId_fkey" FOREIGN KEY ("medalId") REFERENCES "UserMedal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedalSetSlot" ADD CONSTRAINT "MedalSetSlot_setId_fkey" FOREIGN KEY ("setId") REFERENCES "MedalSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedalSetCharacter" ADD CONSTRAINT "MedalSetCharacter_medalSetId_fkey" FOREIGN KEY ("medalSetId") REFERENCES "MedalSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedalSetCharacter" ADD CONSTRAINT "MedalSetCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "UserCharacter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_characterStateId_fkey" FOREIGN KEY ("characterStateId") REFERENCES "CharacterState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterState" ADD CONSTRAINT "CharacterState_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTagRelation" ADD CONSTRAINT "CharacterTagRelation_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTagRelation" ADD CONSTRAINT "CharacterTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "CharacterTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medal" ADD CONSTRAINT "Medal_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniqueTraitConstraintRelation" ADD CONSTRAINT "UniqueTraitConstraintRelation_medalId_fkey" FOREIGN KEY ("medalId") REFERENCES "Medal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniqueTraitConstraintRelation" ADD CONSTRAINT "UniqueTraitConstraintRelation_constraintId_fkey" FOREIGN KEY ("constraintId") REFERENCES "UniqueTraitConstraint"("description") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniqueTraitRelation" ADD CONSTRAINT "UniqueTraitRelation_medalId_fkey" FOREIGN KEY ("medalId") REFERENCES "Medal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniqueTraitRelation" ADD CONSTRAINT "UniqueTraitRelation_uniqueTraitId_fkey" FOREIGN KEY ("uniqueTraitId") REFERENCES "UniqueTrait"("description") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedalTagRelation" ADD CONSTRAINT "MedalTagRelation_medalId_fkey" FOREIGN KEY ("medalId") REFERENCES "Medal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedalTagRelation" ADD CONSTRAINT "MedalTagRelation_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "MedalTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

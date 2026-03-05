
import { Character } from "../src/generated/prisma/browser";
import {
    CharacterState,
    CharacterTag,
    Skill,
} from "../src/generated/prisma/client";
export type CharacterTagExcel = CharacterTag;
export type SkillExcell = {
    isPowerGage?: boolean;
    isTimeGated?: boolean;
} & Omit<Skill, "id" | "characterStateId">;

export type CharacterStateExcel = {
    skills: SkillExcell[];
} & Omit<CharacterState, "id" | "characterId">;

export type CharacterExcel = {
    tags: CharacterTagExcel[];
    characterStates: CharacterStateExcel[];
    medals: string[];
} & Character;

export type CharacterGameData = Pick<
    CharacterExcel,
    | "name"
    | "gameId"
    | "nameId"
    | "mainSize"
    | "teamBoost"
    | "sizeTraits"
    | "characterTraits"
    | "traits1"
    | "traits2"
    | "boostTrait"
    | "inflictsStatusEffect"
    | "nullifiesStatusEffect"
    | "selfStatusEffect"
    | "type"
    | "characterStates"
>;

import { Medal, MedalTag, UniqueTrait, UniqueTraitConstraint } from '@/generated/prisma/client';



export type UniqueTraitConstraintExcel = {
    tag: string | null;
} & Omit<UniqueTraitConstraint, 'tagId'>
export type UniqueTraitExcel = UniqueTrait
type MedalTagExcel = MedalTag

export type MedalExcel = {
    tags: MedalTagExcel[],
    uniqueConstraints: UniqueTraitConstraintExcel[],
    uniqueTraits: UniqueTraitExcel[],

} & Medal
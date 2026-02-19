import { CharacterTag, CharacterTagType } from "@/constants/character-tags";
import { MedalTraitConstraintType } from "@/constants/medal-traits";
import { StatusEffect, StatusEffectType } from "@/constants/status-effects";
import { UniqueTraitConstraintExcel } from "./medal-parser";


function constraintSimple(description: string, constraint: MedalTraitConstraintType): UniqueTraitConstraintExcel {
    return {
        description,
        constraint: constraint as string,
        value: null,
        tag: null,
        statusEffect: null
    }
}

function constraintValue(description: string, constraint: MedalTraitConstraintType, val: number): UniqueTraitConstraintExcel {
    if (!val) {
        console.error('weird value at ' + description + ' val: ' + val)
    }
    return {
        description,
        constraint: constraint as string,
        value: val,
        tag: null,
        statusEffect: null
    }
}

function constraintStatusEffect(description: string, constraint: MedalTraitConstraintType, statusEffect: string): UniqueTraitConstraintExcel {
    const status: StatusEffectType = StatusEffect[statusEffect.toUpperCase().replaceAll(' ', '_').replaceAll('-', '') as StatusEffectType]

    if (!status) {
        console.error('weird effect at ' + description + ' val: ' + statusEffect)
    }
    return {
        description,
        constraint: constraint as string,
        value: null,
        tag: null,
        statusEffect: status as string
    }
}


function constraintTag(description: string, constraint: MedalTraitConstraintType, tagString: string): UniqueTraitConstraintExcel {
    const tag: CharacterTagType = CharacterTag[tagString.toUpperCase().replaceAll(' ', '_').replaceAll('-', '_') as CharacterTagType]

    if (!tag) {
        console.error('weird tag at ' + description + ' val: ' + tagString)
    }
    return {
        description,
        constraint: constraint as string,
        value: null,
        tag: tag as string,
        statusEffect: null
    }



}
export const constraintMap: Record<MedalTraitConstraintType,
    (constraint: string) => UniqueTraitConstraintExcel | undefined
> = {
    AFTER_KO: (constraint: string) => {
        const match = constraint.match(/After KOing an enemy$/i);
        return match ? constraintSimple(constraint, 'AFTER_KO') : undefined;
    },
    AFTER_KO_INCLUDING_ALLY: (constraint: string) => {
        const match = constraint.match(/When you or an ally KOs an enemy$/i);
        return match ? constraintSimple(constraint, 'AFTER_KO_INCLUDING_ALLY') : undefined;
    },
    AFTER_ALLY_WAS_KOD: (constraint: string) => {
        // Usei . para aceitar qualquer tipo de aspa ou caractere no KO'd
        const match = constraint.match(/When an ally is KO.d \(not including you\)$/i);
        return match ? constraintSimple(constraint, 'AFTER_ALLY_WAS_KOD') : undefined;
    },
    HP_OR_LESS_THAN: (constraint: string) => {
        const match = constraint.match(/When your HP is (\d+)% or less$/i);
        return match ? constraintValue(constraint, 'HP_OR_LESS_THAN', Number(match[1])) : undefined;
    },
    HP_OR_MORE_THAN: (constraint: string) => {
        const match = constraint.match(/When your HP is (\d+)% or more$/i);
        return match ? constraintValue(constraint, 'HP_OR_MORE_THAN', Number(match[1])) : undefined;
    },
    AFTER_CAPTURE: (constraint: string) => {
        const match = constraint.match(/When you capture the Treasure$/i);
        return match ? constraintSimple(constraint, 'AFTER_CAPTURE') : undefined;
    },
    AFTER_CAPTURE_INCLUDE_ALLY: (constraint: string) => {
        const match = constraint.match(/When you or an ally captures Treasure$/i);
        return match ? constraintSimple(constraint, 'AFTER_CAPTURE_INCLUDE_ALLY') : undefined;
    },
    SECONDS_OR_LESS_REMAINING: (constraint: string) => {
        const match = constraint.match(/When there are (\d+) seconds or less remaining$/i);
        return match ? constraintValue(constraint, 'SECONDS_OR_LESS_REMAINING', Number(match[1])) : undefined;
    },
    SECONDS_AFTER_GAME_START: (constraint: string) => {
        const match = constraint.match(/For (\d+) seconds after the battle has started$/i);
        return match ? constraintValue(constraint, 'SECONDS_AFTER_GAME_START', Number(match[1])) : undefined;
    },
    TEAM_LESS_TREASURE: (constraint: string) => {
        const match = constraint.match(/When your team has less Treasure secured$/i);
        return match ? constraintSimple(constraint, 'TEAM_LESS_TREASURE') : undefined;
    },
    TEAM_MORE_TREASURE: (constraint: string) => {
        const match = constraint.match(/When your team has more Treasure secured$/i);
        return match ? constraintSimple(constraint, 'TEAM_MORE_TREASURE') : undefined;
    },
    RESPAWNED: (constraint: string) => {
        const match = constraint.match(/When Respawned$/i);
        return match ? constraintSimple(constraint, 'RESPAWNED') : undefined;
    },
    ALLIES_NEAR_TREASURE: (constraint: string) => {
        const match = constraint.match(/When your allies are near the Treasure area where you are at$/i);
        return match ? constraintSimple(constraint, 'ALLIES_NEAR_TREASURE') : undefined;
    },
    ALLIES_NOT_NEAR_TREASURE: (constraint: string) => {
        const match = constraint.match(/When your allies are not near the Treasure area where you are at$/i);
        return match ? constraintSimple(constraint, 'ALLIES_NOT_NEAR_TREASURE') : undefined;
    },
    WHEN_ATTACKED: (constraint: string) => {
        const match = constraint.match(/When attacked by an enemy$/i);
        return match ? constraintSimple(constraint, 'WHEN_ATTACKED') : undefined;
    },
    AROUND_ENEMY_TREASURE: (constraint: string) => {
        const match = constraint.match(/(?:When (?:in|attacking an enemy in) the area around your enemy`s Treasure|When you are in your Enemy`s Treasure Area)$/i);
        return match ? constraintSimple(constraint, 'AROUND_ENEMY_TREASURE') : undefined;
    },
    AROUND_TEAM_TREASURE: (constraint: string) => {
        const match = constraint.match(/When (?:in|attacking an enemy in) the area around your captured Treasure$/i);
        return match ? constraintSimple(constraint, 'AROUND_TEAM_TREASURE') : undefined;
    },
    ANY_TREASURE: (constraint: string) => {
        const match = constraint.match(/When in the Treasure Area$/i);
        return match ? constraintSimple(constraint, 'ANY_TREASURE') : undefined;
    },
    TEAM_LOSES_TREASURE: (constraint: string) => {
        const match = constraint.match(/When your team loses the Treasure$/i);
        return match ? constraintSimple(constraint, 'TEAM_LOSES_TREASURE') : undefined;
    },
    ATTACKING_ENEMY_TYPE: (constraint: string) => {
        const match = constraint.match(/When attacking a character type "([^"]+)" enemy$/i);
        return match ? constraintSimple(constraint, 'ATTACKING_ENEMY_TYPE') : undefined;
    },
    AFTER_SKILL_2: (constraint: string) => {
        const match = constraint.match(/When using Skill 2$/i);
        return match ? constraintSimple(constraint, 'AFTER_SKILL_2') : undefined;
    },
    ATTACKING_WITH_SKILL_2: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy with Skill 2$/i);
        return match ? constraintSimple(constraint, 'ATTACKING_WITH_SKILL_2') : undefined;
    },
    AFTER_SKILL_1: (constraint: string) => {
        const match = constraint.match(/When using Skill 1$/i);
        return match ? constraintSimple(constraint, 'AFTER_SKILL_1') : undefined;
    },
    KNOCKBACK_ENEMY: (constraint: string) => {
        const match = constraint.match(/When you Knockback an enemy$/i);
        return match ? constraintSimple(constraint, 'KNOCKBACK_ENEMY') : undefined;
    },
    KNOCKBACK_BY_ENEMY: (constraint: string) => {
        const match = constraint.match(/When hit with Knockback by enemy$/i);
        return match ? constraintSimple(constraint, 'KNOCKBACK_BY_ENEMY') : undefined;
    },
    AFTER_CRIT_OCCURS: (constraint: string) => {
        const match = constraint.match(/When Critical occurs$/i);
        return match ? constraintSimple(constraint, 'AFTER_CRIT_OCCURS') : undefined;
    },
    AFTER_PERFECT_DODGE: (constraint: string) => {
        const match = constraint.match(/When performing a Perfect Dodge$/i);
        return match ? constraintSimple(constraint, 'AFTER_PERFECT_DODGE') : undefined;
    },
    WHEN_DOWNED: (constraint: string) => {
        const match = constraint.match(/When you are Downed$/i);
        return match ? constraintSimple(constraint, 'WHEN_DOWNED') : undefined;
    },
    ATTACKING_CHARACTER_BY_TYPE: (constraint: string) => {
        const match = constraint.match(/When attacked by a character type \"([^"]+)\" enemy$/i);
        return match ? constraintTag(constraint, 'ATTACKING_CHARACTER_BY_TYPE', match[1]) : undefined;
    },
    ATTACKING_CHARACTER_INFLICTED_WITH_STATUS_EFFECT: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy inflicted With ([^"]+)$/i);
        return match ? constraintStatusEffect(constraint, 'ATTACKING_CHARACTER_INFLICTED_WITH_STATUS_EFFECT', match[1]) : undefined;
    },
    ATTACKED_BY_ENEMY_INFLICTED_WITH_STATUS_EFFECT: (constraint: string) => {
        const match = constraint.match(/When attacked by an enemy inflicted with ([^"]+)$/i);
        return match ? constraintStatusEffect(constraint, 'ATTACKED_BY_ENEMY_INFLICTED_WITH_STATUS_EFFECT', match[1]) : undefined;
    },
    INFLICTED_WITH_STATUS_EFFECT: (constraint: string) => {
        const match = constraint.match(/When inflicted with ([^"]+) by enemies$/i);
        return match ? constraintStatusEffect(constraint, 'INFLICTED_WITH_STATUS_EFFECT', match[1]) : undefined;
    },
    INFLICT_STATUS_EFFECT: (constraint: string) => {
        const match = constraint.match(/When enemies are inflicted with ([^"]+)$/i);
        return match ? constraintStatusEffect(constraint, 'INFLICT_STATUS_EFFECT', match[1]) : undefined;
    },
    ATTACKING_ENEMY_SAME_ELEMENT: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy with the same Element$/i);
        return match ? constraintSimple(constraint, 'ATTACKING_ENEMY_SAME_ELEMENT') : undefined;
    },
    ATTACKING_ENEMY_WITH_WEAKER_ELEMENT: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy with the Element you are strong against$/i);
        return match ? constraintSimple(constraint, 'ATTACKING_ENEMY_WITH_WEAKER_ELEMENT') : undefined;
    },
    ATTACKING_ENEMY_BOOSTED_DEF: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy whose DEF is boosted$/i);
        return match ? constraintSimple(constraint, 'ATTACKING_ENEMY_BOOSTED_DEF') : undefined;
    },
    ATTACKING_ENEMY_BOOSTED_ATK: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy whose ATK are boostedI$/i);
        return match ? constraintSimple(constraint, 'ATTACKING_ENEMY_BOOSTED_ATK') : undefined;
    },
    ATTACKED_BY_ENEMY_BOOSTED_ATK: (constraint: string) => {
        const match = constraint.match(/When attacked by an enemy whose ATK is boosted$/i);
        return match ? constraintSimple(constraint, 'ATTACKED_BY_ENEMY_BOOSTED_ATK') : undefined;
    },
    ATTACKING_ENEMY_CAP_TREASURE: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy that is capturing Treasure$/i);
        return match ? constraintSimple(constraint, 'ATTACKING_ENEMY_CAP_TREASURE') : undefined;
    },
    WHEN_TREASURE_GAUGE_IS_RECOVERED_TO: (constraint: string) => {
        const match = constraint.match(/When Treasure Gauge is recovered to (\d+)%$/i);
        return match ? constraintValue(constraint, 'WHEN_TREASURE_GAUGE_IS_RECOVERED_TO', Number(match[1])) : undefined;
    },
    TREASURE_GAUGE_OR_MORE: (constraint: string) => {
        const match = constraint.match(/Treasure Gauge is (\d+)% or more$/i);
        return match ? constraintValue(constraint, 'TREASURE_GAUGE_OR_MORE', Number(match[1])) : undefined;
    },
    TREASURE_GAUGE_OR_LESS: (constraint: string) => {
        const match = constraint.match(/Treasure Gauge is (\d+)% or less$/i);
        return match ? constraintValue(constraint, 'TREASURE_GAUGE_OR_LESS', Number(match[1])) : undefined;
    },
    USED_CHARACTER_HAS_TAG: (constraint: string) => {
        const match = constraint.match(/When the equipped character is character type \"([^"]+)\"$/i);
        return match ? constraintTag(constraint, 'USED_CHARACTER_HAS_TAG', match[1]) : undefined;
    },
    ATTACKING_ENEMY_WITH_NORMALS: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy with a Normal Attack$/i);
        return match ? constraintSimple(constraint, 'ATTACKING_ENEMY_WITH_NORMALS') : undefined;
    },
    WHEN_SHOCK_NULLIFIED: (constraint: string) => {
        const match = constraint.match(/When a damage_dealing Shock infliction has been nullifed$/i);
        return match ? constraintSimple(constraint, 'WHEN_SHOCK_NULLIFIED') : undefined;
    },
    RECEIVING_DAMAGE_FROM_ENEMY_WHICH_IS_MORE_OF_YOUR_MAX_HP: (constraint: string) => {
        const match = constraint.match(/After reciving damage from an enemy which is more than (\d+)% of your max HP$/i);
        return match ? constraintValue(constraint, 'RECEIVING_DAMAGE_FROM_ENEMY_WHICH_IS_MORE_OF_YOUR_MAX_HP', Number(match[1])) : undefined;
    },
    WHEN_ENEMY_STARTS_CAPTURING: (constraint: string) => {
        const match = constraint.match(/When an enemy begins capturing one of your team`s Treasure Areas$/i);
        return match ? constraintSimple(constraint, 'WHEN_ENEMY_STARTS_CAPTURING') : undefined;
    },
    ATTACKING_ENEMY: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy$/i);
        return match ? constraintSimple(constraint, 'ATTACKING_ENEMY') : undefined;
    },
};
export function getUniqueTraitConstraint(constraint: string): UniqueTraitConstraintExcel | undefined {

    const constraintKeys = Object.keys(constraintMap) as MedalTraitConstraintType[];

    for (const c of constraintKeys) {
        const uniqueConstraint = constraintMap[c](constraint);
        if (uniqueConstraint) {
            return uniqueConstraint;
        }

    }

    console.error('weird constraint at ' + constraint)
    return undefined
}   
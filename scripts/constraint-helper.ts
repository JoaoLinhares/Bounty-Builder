import { CharacterTag, CharacterTagType } from "@/constants/character-tags";
import { MedalTraitConstraintType } from "@/constants/medal-traits";
import { StatusEffect, StatusEffectType } from "@/constants/status-effects";
import { UniqueTraitConstraintExcel } from './type';


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
    // --- COMBATS/KO ---
    ON_KO_SELF: (constraint: string) => {
        const match = constraint.match(/After KOing an enemy$/i);
        return match ? constraintSimple(constraint, 'ON_KO_SELF') : undefined;
    },
    ON_RESPAWN: (constraint: string) => {
        const match = constraint.match(/When Respawned$/i);
        return match ? constraintSimple(constraint, 'ON_RESPAWN') : undefined;
    },
    ON_KO_TEAM: (constraint: string) => {
        const match = constraint.match(/When you or an ally KOs an enemy$/i);
        return match ? constraintSimple(constraint, 'ON_KO_TEAM') : undefined;
    },
    ON_ALLY_DEAD: (constraint: string) => {
        const match = constraint.match(/When an ally is KO.d \(not including you\)$/i);
        return match ? constraintSimple(constraint, 'ON_ALLY_DEAD') : undefined;
    },
    ON_KB_DEALT: (constraint: string) => {
        const match = constraint.match(/When you Knockback an enemy$/i);
        return match ? constraintSimple(constraint, 'ON_KB_DEALT') : undefined;
    },
    ON_KB_TAKEN: (constraint: string) => {
        const match = constraint.match(/When hit with Knockback by enemy$/i);
        return match ? constraintSimple(constraint, 'ON_KB_TAKEN') : undefined;
    },
    ON_DOWN_DEALT: (constraint: string) => {
        const match = constraint.match(/When you Down an enemy$/i);
        return match ? constraintSimple(constraint, 'ON_DOWN_DEALT') : undefined;
    },
    ON_DOWN_TAKEN: (constraint: string) => {
        const match = constraint.match(/When you are Downed$/i);
        return match ? constraintSimple(constraint, 'ON_DOWN_TAKEN') : undefined;
    },

    // --- HP AND TIME ---
    HP_LT: (constraint: string) => {
        const match = constraint.match(/When your HP is (\d+)% or less$/i);
        return match ? constraintValue(constraint, 'HP_LT', Number(match[1])) : undefined;
    },
    HP_GT: (constraint: string) => {
        const match = constraint.match(/When your HP is (\d+)% or more$/i);
        return match ? constraintValue(constraint, 'HP_GT', Number(match[1])) : undefined;
    },
    TIME_LT: (constraint: string) => {
        const match = constraint.match(/When there are (\d+) seconds or less remaining$/i);
        return match ? constraintValue(constraint, 'TIME_LT', Number(match[1])) : undefined;
    },
    TIME_GT: (constraint: string) => {
        const match = constraint.match(/When there are (\d+) seconds or more remaining$/i);
        return match ? constraintValue(constraint, 'TIME_GT', Number(match[1])) : undefined;
    },
    ON_MATCH_START_TIMED: (constraint: string) => {
        const match = constraint.match(/For (\d+) seconds after the battle has started$/i);
        return match ? constraintValue(constraint, 'ON_MATCH_START_TIMED', Number(match[1])) : undefined;
    },

    // --- TREASURES ---
    TREASURE_LESS: (constraint: string) => {
        const match = constraint.match(/When your team has less Treasure secured$/i);
        return match ? constraintSimple(constraint, 'TREASURE_LESS') : undefined;
    },
    TREASURE_MORE: (constraint: string) => {
        const match = constraint.match(/When your team has more Treasure secured$/i);
        return match ? constraintSimple(constraint, 'TREASURE_MORE') : undefined;
    },
    ON_CAP_SELF: (constraint: string) => {
        const match = constraint.match(/When you capture the Treasure$/i);
        return match ? constraintSimple(constraint, 'ON_CAP_SELF') : undefined;
    },
    ON_CAP_TEAM: (constraint: string) => {
        const match = constraint.match(/When you or an ally captures Treasure$/i);
        return match ? constraintSimple(constraint, 'ON_CAP_TEAM') : undefined;
    },
    AREA_ENEMY: (constraint: string) => {
        const match = constraint.match(/(?:When (?:in|attacking an enemy in) the area around your enemy`s Treasure|When you are in your Enemy`s Treasure Area)$/i);
        return match ? constraintSimple(constraint, 'AREA_ENEMY') : undefined;
    },
    AREA_TEAM: (constraint: string) => {
        const match = constraint.match(/(?:When (?:in|attacking an enemy in) the area around your captured Treasure|When you are in your team`s Treasure Area)$/i);
        return match ? constraintSimple(constraint, 'AREA_TEAM') : undefined;
    },
    AREA_ANY: (constraint: string) => {
        const match = constraint.match(/When in the Treasure Area$/i);
        return match ? constraintSimple(constraint, 'AREA_ANY') : undefined;
    },
    ALLY_NEAR: (constraint: string) => {
        const match = constraint.match(/When your allies are near the Treasure area where you are at$/i);
        return match ? constraintSimple(constraint, 'ALLY_NEAR') : undefined;
    },
    ALLY_AWAY: (constraint: string) => {
        const match = constraint.match(/When your allies are not near the Treasure area where you are at$/i);
        return match ? constraintSimple(constraint, 'ALLY_AWAY') : undefined;
    },
    GAUGE_SET: (constraint: string) => {
        const match = constraint.match(/When Treasure Gauge is recovered to (\d+)%$/i);
        return match ? constraintValue(constraint, 'GAUGE_SET', Number(match[1])) : undefined;
    },
    GAUGE_GT: (constraint: string) => {
        const match = constraint.match(/Tr(?:e)?asure Gauge is (\d+)% or more$/i);
        return match ? constraintValue(constraint, 'GAUGE_GT', Number(match[1])) : undefined;
    },
    GAUGE_LT: (constraint: string) => {
        const match = constraint.match(/Treasure Gauge is (\d+)% or less$/i);
        return match ? constraintValue(constraint, 'GAUGE_LT', Number(match[1])) : undefined;
    },
    ON_FLAG_LOST: (constraint: string) => {
        const match = constraint.match(/When your team loses the Treasure$/i);
        return match ? constraintSimple(constraint, 'ON_FLAG_LOST') : undefined;
    },
    // --- SKILLS AND STATUS ---
    ON_S2_USE: (constraint: string) => {
        const match = constraint.match(/When using Skill 2$/i);
        return match ? constraintSimple(constraint, 'ON_S2_USE') : undefined;
    },
    ON_S2_HIT: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy with Skill 2$/i);
        return match ? constraintSimple(constraint, 'ON_S2_HIT') : undefined;
    },
    ON_S1_USE: (constraint: string) => {
        const match = constraint.match(/When using Skill 1$/i);
        return match ? constraintSimple(constraint, 'ON_S1_USE') : undefined;
    },
    ON_STATUS_GET: (constraint: string) => {
        const match = constraint.match(/When inflicted with ([^"]+) by enemies$/i);
        return match ? constraintStatusEffect(constraint, 'ON_STATUS_GET', match[1]) : undefined;
    },
    ON_STATUS_SET: (constraint: string) => {
        const match = constraint.match(/When enemies are inflicted with ([^"]+)$/i);
        return match ? constraintStatusEffect(constraint, 'ON_STATUS_SET', match[1]) : undefined;
    },
    ON_STATUS_NULL: (constraint: string) => {
        const match = constraint.match(/When a damage-dealing ([^"]+) infliction has been nullifed$/i);
        return match ? constraintStatusEffect(constraint, 'ON_STATUS_NULL', match[1]) : undefined;
    },
    ON_ATTACK_STATUS: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy inflicted With ([^"]+)$/i);
        return match ? constraintStatusEffect(constraint, 'ON_ATTACK_STATUS', match[1]) : undefined;
    },
    ON_ATTACKED_STATUS: (constraint: string) => {
        const match = constraint.match(/When attacked by an enemy inflicted with ([^"]+)$/i);
        return match ? constraintStatusEffect(constraint, 'ON_ATTACKED_STATUS', match[1]) : undefined;
    },

    // --- OTHER INTERACTIONS ---
    ON_NORMALS: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy with a Normal Attack$/i);
        return match ? constraintSimple(constraint, 'ON_NORMALS') : undefined;
    },
    ON_ATTACK_TAG: (constraint: string) => {
        const match = constraint.match(/When attacking a character type "([^"]+)" enemy$/i);
        return match ? constraintTag(constraint, 'ON_ATTACK_TAG', match[1]) : undefined;
    },
    ON_ATTACKED_TAG: (constraint: string) => {
        const match = constraint.match(/When attacked by a character type \"([^"]+)\" enemy$/i);
        return match ? constraintTag(constraint, 'ON_ATTACKED_TAG', match[1]) : undefined;
    },
    ON_ATTACK_CAP: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy that is capturing Treasure$/i);
        return match ? constraintSimple(constraint, 'ON_ATTACK_CAP') : undefined;
    },
    ON_ENEMY_CAP: (constraint: string) => {
        const match = constraint.match(/When an enemy begins capturing one of your team`s Treasure Areas$/i);
        return match ? constraintSimple(constraint, 'ON_ENEMY_CAP') : undefined;
    },
    ON_CRIT: (constraint: string) => {
        const match = constraint.match(/When Critical occurs$/i);
        return match ? constraintSimple(constraint, 'ON_CRIT') : undefined;
    },
    ON_PDODGE: (constraint: string) => {
        const match = constraint.match(/When performing a Perfect Dodge$/i);
        return match ? constraintSimple(constraint, 'ON_PDODGE') : undefined;
    },
    ON_ATTACK: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy$/i);
        return match ? constraintSimple(constraint, 'ON_ATTACK') : undefined;
    },
    ON_ATTACKED: (constraint: string) => {
        const match = constraint.match(/When attacked by an enemy$/i);
        return match ? constraintSimple(constraint, 'ON_ATTACKED') : undefined;
    },
    ON_BIG_HIT: (constraint: string) => {
        const match = constraint.match(/After reciving damage from an enemy which is more than (\d+)% of your max HP$/i);
        return match ? constraintValue(constraint, 'ON_BIG_HIT', Number(match[1])) : undefined;
    },
    ON_ATTACK_ELEM_SAME: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy with the same Element$/i);
        return match ? constraintSimple(constraint, 'ON_ATTACK_ELEM_SAME') : undefined;
    },
    ON_ATTACK_ELEM_WEAKER: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy with the Element you are strong against$/i);
        return match ? constraintSimple(constraint, 'ON_ATTACK_ELEM_WEAKER') : undefined;
    },
    ON_ATTACK_BUFF_DEF: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy whose DEF is boosted$/i);
        return match ? constraintSimple(constraint, 'ON_ATTACK_BUFF_DEF') : undefined;
    },
    ON_ATTACK_BUFF_ATK: (constraint: string) => {
        const match = constraint.match(/When attacking an enemy whose ATK are boosted$/i);
        return match ? constraintSimple(constraint, 'ON_ATTACK_BUFF_ATK') : undefined;
    },
    ON_ATTACKED_BUFF_ATK: (constraint: string) => {
        const match = constraint.match(/When attacked by an enemy whose ATK is boosted$/i);
        return match ? constraintSimple(constraint, 'ON_ATTACKED_BUFF_ATK') : undefined;
    },
    SELF_TAG: (constraint: string) => {
        const match = constraint.match(/When the equipped character is character type \"([^"]+)\"$/i);
        return match ? constraintTag(constraint, 'SELF_TAG', match[1]) : undefined;
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
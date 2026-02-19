import { MedalTraitType } from "@/constants/medal-traits";
import { UniqueTraitExcel } from "./medal-parser";

/*
function traitSimple(description: string, trait: MedalTraittraitType): UniqueTraittraitExcel {
    return {
        description,
        trait: trait as string,
        value: null,
        tag: null,
        statusEffect: null
    }
}


function traitStatusEffect(description: string, trait: MedalTraittraitType, statusEffect: string): UniqueTraittraitExcel {
    const status: StatusEffectType = StatusEffect[statusEffect.toUpperCase().replaceAll(' ', '_').replaceAll('-', '') as StatusEffectType]

    if (!status) {
        console.error('weird effect at ' + description + ' val: ' + statusEffect)
    }
    return {
        description,
        trait: trait as string,
        value: null,
        tag: null,
        statusEffect: status as string
    }
}


function traitTag(description: string, trait: MedalTraittraitType, tagString: string): UniqueTraittraitExcel {
    const tag: CharacterTagType = CharacterTag[tagString.toUpperCase().replaceAll(' ', '_').replaceAll('-', '_') as CharacterTagType]

    if (!tag) {
        console.error('weird tag at ' + description + ' val: ' + tagString)
    }
    return {
        description,
        trait: trait as string,
        value: null,
        tag: tag as string,
        statusEffect: null
    }



}
    */

function traitValue(description: string, trait: MedalTraitType, val: number): UniqueTraitExcel {
    if (!val) {
        console.error('weird value at ' + description + ' val: ' + val)
    }
    return {
        description,
        trait: trait as string,
        value: val,
        time: null,
    }
}

function traitTime(description: string, trait: MedalTraitType, val: number, time: number): UniqueTraitExcel {
    if (!val || !time) {
        console.error('weird value/time at ' + description + ' val: ' + val + ' time: ' + time)
    }
    return {
        description,
        trait: trait as string,
        value: val,
        time: time,
    }
}

export const traitMap: Record<MedalTraitType,
    (trait: string) => UniqueTraitExcel | undefined
> = {
    // --- DAMAGE / REDUCTION ---
    DAMAGE_INCREASE: (trait: string) => {
        const match = trait.match(/Increase damage dealt by (\d+)%$/i);
        return match ? traitValue(trait, 'DAMAGE_INCREASE', Number(match[1])) : undefined;
    },
    DAMAGE_REDUCTION: (trait: string) => {
        const match = trait.match(/Reduce damage received by (\d+)%$/i);
        return match ? traitValue(trait, 'DAMAGE_REDUCTION', Number(match[1])) : undefined;
    },
    NORMAL_ATK_DAMAGE: (trait: string) => {
        const match = trait.match(/Increase Normal Attack damage dealt by (\d+)%$/i);
        return match ? traitValue(trait, 'NORMAL_ATK_DAMAGE', Number(match[1])) : undefined;
    },

    // --- COOLDOWN SPEED (SPEED PERCENTAGE) ---
    BOOST_CD_SKILL_1: (trait: string) => {
        const match = trait.match(/Boost the cooldown reduction speed of Skill 1 by (\d+)%$/i);
        return match ? traitValue(trait, 'BOOST_CD_SKILL_1', Number(match[1])) : undefined;
    },
    BOOST_CD_SKILL_2: (trait: string) => {
        const match = trait.match(/Boost the cooldown reduction speed of Skill 2 by (\d+)%$/i);
        return match ? traitValue(trait, 'BOOST_CD_SKILL_2', Number(match[1])) : undefined;
    },
    BOOST_CD_DODGE: (trait: string) => {
        const match = trait.match(/Boost the cooldown reduction speed of dodge by (\d+)%$/i);
        return match ? traitValue(trait, 'BOOST_CD_DODGE', Number(match[1])) : undefined;
    },

    // --- FLAT REDUCTION (IMMEDIATE) ---
    REDUCE_CD_SKILL_1: (trait: string) => {
        const match = trait.match(/Reduce the cooldown time of Skill 1 by (\d+)%$/i);
        return match ? traitValue(trait, 'REDUCE_CD_SKILL_1', Number(match[1])) : undefined;
    },
    REDUCE_CD_SKILL_2: (trait: string) => {
        const match = trait.match(/Reduce the cooldown time of Skill 2 by (\d+)%$/i);
        return match ? traitValue(trait, 'REDUCE_CD_SKILL_2', Number(match[1])) : undefined;
    },

    // --- STATS PERCENTAGE ---
    HP_PERCENTAGE: (trait: string) => {
        const match = trait.match(/Increase HP by (\d+)%$/i);
        return match ? traitValue(trait, 'HP_PERCENTAGE', Number(match[1])) : undefined;
    },
    ATK_PERCENTAGE: (trait: string) => {
        const match = trait.match(/Increase ATK by (\d+)%$/i);
        return match ? traitValue(trait, 'ATK_PERCENTAGE', Number(match[1])) : undefined;
    },
    DEF_PERCENTAGE: (trait: string) => {
        const match = trait.match(/Increase DEF by (\d+)%$/i);
        return match ? traitValue(trait, 'DEF_PERCENTAGE', Number(match[1])) : undefined;
    },
    CRIT_PERCENTAGE: (trait: string) => {
        const match = trait.match(/Increase CRIT by (\d+)%$/i);
        return match ? traitValue(trait, 'CRIT_PERCENTAGE', Number(match[1])) : undefined;
    },
    SPD_PERCENTAGE: (trait: string) => {
        const match = trait.match(/SPD Boosted by (\d+)% for (\d+) second\(s\)$/i);
        return match ? traitTime(trait, 'SPD_PERCENTAGE', Number(match[1]), Number(match[2])) : undefined;
    },

    // --- STATS POINTS ---
    HP_POINTS: () => {
        return undefined
    },
    ATK_POINTS: () => {
        return undefined
    },
    DEF_POINTS: () => {
        return undefined
    },
    CRIT_POINTS: () => {
        return undefined
    },

    // --- RECOVERY / CAPTURE ---
    CAPTURE_SPEED: (trait: string) => {
        const match = trait.match(/Boost capture speed by (\d+)%$/i);
        return match ? traitValue(trait, 'CAPTURE_SPEED', Number(match[1])) : undefined;
    },
    HP_RECOVERY: (trait: string) => {
        const match = trait.match(/(.*): Recover HP by (\d+)%$/i);
        return match ? traitValue(trait, 'HP_RECOVERY', Number(match[2])) : undefined;
    },
    INCREASE_TREASURE_GAUGE_RECOVERY: (trait: string) => {
        const match = trait.match(/(.*): Increase Treasure Gauge recovery amount by (\d+)%$/i);
        return match ? traitValue(trait, 'INCREASE_TREASURE_GAUGE_RECOVERY', Number(match[2])) : undefined;
    },
    INCREASE_TREASURE_GAUGE_AMMOUNT_WHEN_CAPTURE: (trait: string) => {
        const match = trait.match(/(.*): When capturing Treasure, increase Treasure Gauge recovery amount by (\d+)%$/i);
        return match ? traitValue(trait, 'INCREASE_TREASURE_GAUGE_AMMOUNT_WHEN_CAPTURE', Number(match[2])) : undefined;
    },

    // --- BOOSTS (TIMED) ---
    BOOST_CRIT: (trait: string) => {
        const match = trait.match(/CRIT Boosted by (\d+)% for (\d+) second\(s\)$/i);
        return match ? traitTime(trait, 'BOOST_CRIT', Number(match[1]), Number(match[2])) : undefined;
    },
    BOOST_SPEED: (trait: string) => {
        const match = trait.match(/SPD Boosted by (\d+)% for (\d+) second\(s\)$/i);
        return match ? traitTime(trait, 'SPD_PERCENTAGE', Number(match[1]), Number(match[2])) : undefined;
    },

    // --- NULLIFY ---
    NULLIFY_STUN: (trait: string) => {
        const match = trait.match(/(.*): Nullify Stun$/i);
        return match ? traitSimple(trait, 'NULLIFY_STUN') : undefined;
    },
    NULLIFY_SHOCK: (trait: string) => {
        const match = trait.match(/(.*): Nullify Shock$/i);
        return match ? traitSimple(trait, 'NULLIFY_SHOCK') : undefined;
    },
    NULLIFY_TREMOR: (trait: string) => {
        const match = trait.match(/(.*): Nullify Tremor$/i);
        return match ? traitSimple(trait, 'NULLIFY_TREMOR') : undefined;
    },
    NULLIFY_FREEZE: (trait: string) => {
        const match = trait.match(/(.*): Nullify Freeze$/i);
        return match ? traitSimple(trait, 'NULLIFY_FREEZE') : undefined;
    },
    NULLIFY_AFLAME: (trait: string) => {
        const match = trait.match(/(.*): Nullify Aflame$/i);
        return match ? traitSimple(trait, 'NULLIFY_AFLAME') : undefined;
    },

    // --- INFLICT ---
    INFLICT_POISON: (trait: string) => {
        const match = trait.match(/(.*): (\d+)% chance to inflict Poison$/i);
        return match ? traitValue(trait, 'INFLICT_POISON', Number(match[2])) : undefined;
    },
    INFLICT_SHOCK: (trait: string) => {
        const match = trait.match(/(.*): (\d+)% chance to inflict Shock$/i);
        return match ? traitValue(trait, 'INFLICT_SHOCK', Number(match[2])) : undefined;
    },

    // --- REDUCTION (STATUS) ---
    STATUS_EFFECT_REDUCTION: (trait: string) => {
        const match = trait.match(/(.*): Reduce time spent inflicted with (.*) by (\d+)%$/i);
        // Usando o valor da porcentagem (match[3])
        return match ? traitValue(trait, 'STATUS_EFFECT_REDUCTION', Number(match[3])) : undefined;
    },
};
export function getUniqueTrait(trait: string): UniqueTraitExcel | undefined {

    const traitKeys = Object.keys(traitMap) as MedalTraitType[];

    for (const c of traitKeys) {
        const uniqueTrait = traitMap[c](trait);
        if (uniqueTrait) {
            return uniqueTrait;
        }

    }

    console.error('weird trait at ' + trait)
    return undefined
}   
import { MedalTraitType } from "@/constants/medal-traits";
import { StatusEffect, StatusEffectType } from "@/constants/status-effects";
import { UniqueTraitExcel } from "./medal-parser";

function traitSimple(description: string, trait: MedalTraitType): UniqueTraitExcel {

    return {
        description,
        trait: trait as string,
        value: null,
        time: null,
        statusEffect: null
    }
}

function traitValue(description: string, trait: MedalTraitType, val: number): UniqueTraitExcel {
    if (!val) {
        console.error('weird value at ' + description + ' val: ' + val)
    }
    return {
        description,
        trait: trait as string,
        value: val,
        time: null,
        statusEffect: null
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
        statusEffect: null
    }
}


function traitStatusEffect(description: string, trait: MedalTraitType, val: number, statusEffect: string, time: number | null = null): UniqueTraitExcel {
    const status: StatusEffectType = StatusEffect[statusEffect.toUpperCase().replaceAll(' ', '_').replaceAll('-', '') as StatusEffectType]

    if (!status) {
        console.error('weird effect at ' + description + ' val: ' + statusEffect)
    }
    return {
        description,
        trait: trait as string,
        value: val,
        time: time,
        statusEffect: status as string
    }
}

export const traitMap: Record<MedalTraitType,
    (trait: string) => UniqueTraitExcel | undefined
> = {
    // --- DAMAGE / REDUCTION ---
    DMG_INCREASE: (trait: string) => {
        const match = trait.match(/Increase damage dealt(?: to Defenders)? by (\d+)%$/i);
        return match ? traitValue(trait, 'DMG_INCREASE', Number(match[1])) : undefined;
    },
    DMG_REDUCTION: (trait: string) => {
        const match = trait.match(/Reduce damage recieved by (\d+)%$/i);
        return match ? traitValue(trait, 'DMG_REDUCTION', Number(match[1])) : undefined;
    },
    NORMAL_ATK_DAMAGE: (trait: string) => {
        const match = trait.match(/Increase Normal Attack damage dealt by (\d+)%$/i);
        return match ? traitValue(trait, 'NORMAL_ATK_DAMAGE', Number(match[1])) : undefined;
    },

    // --- COOLDOWN SPEED  ---
    SKILL_1_CD_SPEED: (trait: string) => {
        const match = trait.match(/Boost the cooldown reduction speed of Skill 1 by (\d+)%$/i);
        return match ? traitValue(trait, 'SKILL_1_CD_SPEED', Number(match[1])) : undefined;
    },
    SKILL_2_CD_SPEED: (trait: string) => {
        const match = trait.match(/Boost the cooldown reduction speed of Skill 2 by (\d+)%$/i);
        return match ? traitValue(trait, 'SKILL_2_CD_SPEED', Number(match[1])) : undefined;
    },
    DODGE_CD_SPEED: (trait: string) => {
        const match = trait.match(/Boost the cooldown reduction speed of dodge by (\d+)%$/i);
        return match ? traitValue(trait, 'DODGE_CD_SPEED', Number(match[1])) : undefined;
    },

    // --- FLAT REDUCTION (IMMEDIATE) ---
    SKILL_1_CD_REDUCTION: (trait: string) => {
        const match = trait.match(/Reduce the cooldown time of Skill 1 by (\d+)%$/i);
        return match ? traitValue(trait, 'SKILL_1_CD_REDUCTION', Number(match[1])) : undefined;
    },
    SKILL_2_CD_REDUCTION: (trait: string) => {
        const match = trait.match(/Reduce the cooldown time of Skill 2 by (\d+)%$/i);
        return match ? traitValue(trait, 'SKILL_2_CD_REDUCTION', Number(match[1])) : undefined;
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
    SPD_PERCENTAGE: () => {
        return undefined
    },

    // --- STATS FLAT ---
    HP_FLAT: () => {
        return undefined
    },
    ATK_FLAT: () => {
        return undefined
    },
    DEF_FLAT: () => {
        return undefined
    },
    CRIT_FLAT: () => {
        return undefined
    },

    // --- RECOVERY / CAPTURE ---
    CAPTURE_SPEED: (trait: string) => {
        const match = trait.match(/Boost capture speed by (\d+)%$/i);
        return match ? traitValue(trait, 'CAPTURE_SPEED', Number(match[1])) : undefined;
    },
    HP_RECOVERY: (trait: string) => {
        const match = trait.match(/Recover HP by (\d+)%$/i);
        return match ? traitValue(trait, 'HP_RECOVERY', Number(match[1])) : undefined;
    },
    TREASURE_GAUGE_RECOVERY: (trait: string) => {
        const match = trait.match(/Increase Treasure Gauge recovery amount$/i);
        return match ? traitSimple(trait, 'TREASURE_GAUGE_RECOVERY') : undefined;
    },
    TREASURE_GAUGE_CAPTURE: (trait: string) => {
        const match = trait.match(/Increase Treasure Gauge amount when you capture the Treasure$/i);
        return match ? traitSimple(trait, 'TREASURE_GAUGE_CAPTURE') : undefined;
    },

    // --- BOOSTS (TIMED) ---
    BUFF_CRIT_TIMED: (trait: string) => {
        const match = trait.match(/CRIT Boosted by (\d+)% for (\d+) second\(s\)$/i);
        return match ? traitTime(trait, 'BUFF_CRIT_TIMED', Number(match[1]), Number(match[2])) : undefined;
    },
    BUFF_SPD_TIMED: (trait: string) => {
        const match = trait.match(/SPD Boosted by (\d+)% for (\d+) second\(s\)$/i);
        return match ? traitTime(trait, 'BUFF_SPD_TIMED', Number(match[1]), Number(match[2])) : undefined;
    },

    // --- NULLIFY ---
    STATUS_NULLIFY_CHANCE: (trait: string) => {
        const match = trait.match(/(\d+)% chance to, Nullify ([^"]+)$/i);
        return match ? traitStatusEffect(trait, 'STATUS_NULLIFY_CHANCE', Number(match[1]), match[2]) : undefined;
    },


    // --- INFLICT ---
    STATUS_INFLICT_CHANCE: (trait: string) => {
        const match = trait.match(/(\d+)% chance to, Inflict ([^"]+) for (\d+) second\(s\)/i);
        return match ? traitStatusEffect(trait, 'STATUS_INFLICT_CHANCE', Number(match[1]), match[2], Number(match[3])) : undefined;
    },


    // --- REDUCTION (STATUS) ---
    STATUS_REDUCTION: () => {
        return undefined
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
export enum StatusEffect {
    SHOCK = "SHOCK",
    FREEZE = "FREEZE",
    TREMOR = "TREMOR",
    AFLAME = "AFLAME",
    RECOVERY_BLOCK = "RECOVERY_BLOCK",
    POISON = "POISON",
    SINGSING = "SINGSING",
    STUN = "STUN",
}

export type StatusEffectType = keyof typeof StatusEffect;
import z from "zod";

export const HeroTokenDataZod = z.object({
  type: z.literal("HERO").optional(),
  name: z.string().optional(),
  gmOnly: z.boolean().optional(),
  stamina: z.number().optional(),
  staminaMaximum: z.number().optional(),
  temporaryStamina: z.number().optional(),
  heroicResource: z.number().optional(),
  recoveries: z.number().optional(),
  surges: z.number().optional(),
  statblockName: z.string().optional(),
  heroicResourceButton: z
    .union([
      z.literal("D3"),
      z.literal("D3+1"),
      z.literal("+2"),
      z.literal("+3"),
    ])
    .optional(),
  heroicResourceName: z.string().optional(),
  notes: z.string().optional(),
});

export const MonsterTokenDataZod = z.object({
  type: z.literal("MONSTER"),
  name: z.string().optional(),
  gmOnly: z.boolean().optional(),
  stamina: z.number().optional(),
  staminaMaximum: z.number().optional(),
  temporaryStamina: z.number().optional(),
  statblockName: z.string().optional(),
});

// Don't add anything that can will change after initialization
export const MinionTokenDataZod = z.object({
  type: z.literal("MINION"),
  groupId: z.string(),
});

export const CharacterTokenDataZod = z
  .union([HeroTokenDataZod, MonsterTokenDataZod, MinionTokenDataZod])
  .optional();

export const DefinedHeroTokenDataZod = z.object({
  type: z.literal("HERO"),
  name: z.string(),
  gmOnly: z.boolean(),
  stamina: z.number(),
  staminaMaximum: z.number(),
  temporaryStamina: z.number(),
  heroicResource: z.number(),
  recoveries: z.number(),
  surges: z.number(),
  statblockName: z.string(),
  heroicResourceButton: z.union([
    z.literal("D3"),
    z.literal("D3+1"),
    z.literal("+2"),
    z.literal("+3"),
  ]),
  heroicResourceName: z.string(),
  notes: z.string(),
});

export const DefinedMonsterTokenDataZod = z.object({
  type: z.literal("MONSTER"),
  name: z.string(),
  gmOnly: z.boolean(),
  stamina: z.number(),
  staminaMaximum: z.number(),
  temporaryStamina: z.number(),
  statblockName: z.string(),
});

export const DefinedMinionTokenDataZod = z.object({
  type: z.literal("MINION"),
  groupId: z.string(),
});

export const DefinedCharacterTokenDataZod = z.union([
  DefinedHeroTokenDataZod,
  DefinedMonsterTokenDataZod,
  DefinedMinionTokenDataZod,
]);

export type HeroTokenData = z.infer<typeof HeroTokenDataZod>;
export type MonsterTokenData = z.infer<typeof MonsterTokenDataZod>;
export type MinionTokenData = z.infer<typeof MinionTokenDataZod>;
export type CharacterTokenData = z.infer<typeof CharacterTokenDataZod>;
export type DefinedHeroTokenData = z.infer<typeof DefinedHeroTokenDataZod>;
export type DefinedMonsterTokenData = z.infer<
  typeof DefinedMonsterTokenDataZod
>;
export type DefinedMinionTokenData = z.infer<typeof DefinedMinionTokenDataZod>;
export type DefinedCharacterTokenData = z.infer<
  typeof DefinedCharacterTokenDataZod
>;

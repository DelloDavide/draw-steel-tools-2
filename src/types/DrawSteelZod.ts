import z from "zod";

export const DrawSteelEffectZod = z.strictObject({
  name: z.string().optional(),
  cost: z.string().optional(),
  effect: z.string().optional(),
  roll: z.string().optional(),
  tier1: z.string().optional(),
  tier2: z.string().optional(),
  tier3: z.string().optional(),
  features: z.unknown().optional(),
});

export const DrawSteelFeatureZod = z.strictObject({
  name: z.string(),
  type: z.literal("feature"),
  feature_type: z.union([
    z.literal("ability"), 
    z.literal("trait"), 
    z.literal("Aspect Feature"),
    z.literal("Fury Feature"),
    z.literal("Perk"),
  ]),
  icon: z.string(),
  usage: z.string().optional(), // says required in schema, appears to be optional
  cost: z.string().optional(),
  ability_type: z.string().optional(), // villain action # is saved here, not in usage as is specified by the schema
  keywords: z.array(z.string()).optional(),
  distance: z.string().optional(),
  target: z.string().optional(),
  trigger: z.string().optional(),
  effects: z.array(DrawSteelEffectZod),
  flavor: z.string().optional(),
  metadata: z.object().optional(),
});

export const DrawSteelFeatureBlockZod = z.strictObject({
  name: z.string(),
  type: z.literal("featureblock"),
  featureblock_type: z.union([
    z.literal("Features"),
    z.literal("+ Malice Features"), // should the "+" be here? I think the level entry existing is sufficient indication that this need to be filtered by level
    z.literal("Malice Features"),
    z.literal("Ajax Feature"),
  ]),
  level: z.number().optional(),
  flavor: z.string(),
  features: z.array(DrawSteelFeatureZod),
});

export const DrawSteelStatblockZod = z.strictObject({
  name: z.string(),
  type: z.literal("statblock"),
  level: z.number(), // optional in schema, everything passes validation if it's mandatory
  roles: z.array(z.string()), // once this is broken into organization and roll this can be a union of literals
  ancestry: z.array(z.string()), // will change to keywords
  ev: z.string(),
  stamina: z.string(),
  immunities: z.array(z.string()).optional(), // could be array of all damage types
  weaknesses: z.array(z.string()).optional(),
  speed: z.int(),
  movement: z.string().optional(),
  size: z.string(), // could be literal union
  stability: z.int(),
  free_strike: z.int(),
  might: z.int(),
  agility: z.int(),
  reason: z.int(),
  intuition: z.int(),
  presence: z.int(),
  with_captain: z.string().optional(),
  features: z.array(DrawSteelFeatureZod).optional(),
});

export type DrawSteelEffect = z.infer<typeof DrawSteelEffectZod>;
export type DrawSteelFeature = z.infer<typeof DrawSteelFeatureZod>;
export type DrawSteelFeatureBlock = z.infer<typeof DrawSteelFeatureBlockZod>;
export type DrawSteelStatblock = z.infer<typeof DrawSteelStatblockZod>;

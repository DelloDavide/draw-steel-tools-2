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

const FeatureTypeZod = z
  .string()
  .transform((val) => val.toLowerCase())
  .pipe(
    z.enum([
      "ability",
      "trait",
      "aspect feature",
      "fury feature",
      "null feature",
      "conduit feature",
      "elementalist feature",
      "tactician feature",
      "perk",
      "title",
    ])
  );

export const DrawSteelFeatureZod = z.strictObject({
  name: z.string(),
  type: z.literal("feature"),
  feature_type: FeatureTypeZod,
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

export const DrawSteelSkillCategoryZod = z.strictObject({
  category: z.string(),
  skills: z.array(z.string()),
});

export const DrawSteelSkillBlockZod = z.strictObject({
  name: z.string(),
  type: z.literal("skillblock"),
  flavor: z.string(),
  categories: z.array(DrawSteelSkillCategoryZod),
});

export const DrawSteelImageZod = z.strictObject({
  type: z.literal("image"),
  src: z.string().url(),
});

const ProjectTypeZod = z.string().pipe(
  z.enum([
    "Build Airship",
    "Build Or Repair Road",
    "Craft Teleportation Platform",
    "Craft Treasure",
    "Find A Cure",
    "Imbue Treasure",
    "Imbue Armor",
    "Imbue Implement",
    "Imbue Weapon",
    "Discover Lore",
    "Go Undercover",
    "Hone Career Skills",
    "Learn From A Master",
    "Learn New Language",
    "Learn New Skill",
    "Perfect New Recipe",
    "Community Service",
  ])
);

const ProjectStatusZod = z.enum([
  "Not Started",
  "In Progress",
  "Completed",
  "Paused",
  "Abandoned",
]);

const ProjectPriorityZod = z.enum([
  "Low",
  "Medium",
  "High",
  "Critical",
]);

export const DrawSteelProjectZod = z.strictObject({
  // Core
  type: ProjectTypeZod,
  name: z.string(),

  // Progress
  progress: z.number().int().nonnegative(),
  completion: z.number().int().positive(),

  // Useful derived/gameplay data
  status: ProjectStatusZod.default("In Progress"),
  priority: ProjectPriorityZod.default("Medium"),

  // Lore / RP
  description: z.string().optional(),
  flavor: z.string().optional(),

  // Mechanics
  project_source: z.string().optional(),
  project_roll_characteristic: z
    .array(
      z.enum([
        "Might",
        "Agility",
        "Reason",
        "Intuition",
        "Presence",
      ])
    )
    .optional(),

  item_prerequisite: z.array(z.string()).optional(),

  // Ownership
  owner: z.string().optional(),
  contributors: z.array(z.string()).default([]),

  // Tracking
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  last_progress_at: z.string().datetime().optional(),

  // Rewards / outcome
  reward: z.string().optional(),
  renown_reward: z.number().int().nonnegative().optional(),

  // Notes
  notes: z.array(z.string()).default([]),

  // Tags / filtering
  tags: z.array(z.string()).default([]),

  // Optional automation helpers
  auto_complete: z.boolean().default(false),
  hidden: z.boolean().default(false),

  // UI helpers
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const DrawSteelProjectBlockZod = z.strictObject({
  type: z.literal("projectblock"),
  projectblock_type: z.literal("Projects"),

  // Display
  name: z.string(),
  flavor: z.string(),

  // Ownership
  owner: z.string().optional(),
  party: z.string().optional(),

  // Metadata
  campaign: z.string().optional(),
  chapter: z.string().optional(),

  // Projects
  projects: z.array(DrawSteelProjectZod),

  // Global notes
  notes: z.array(z.string()).default([]),

  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type DrawSteelEffect = z.infer<typeof DrawSteelEffectZod>;
export type DrawSteelFeature = z.infer<typeof DrawSteelFeatureZod>;
export type DrawSteelFeatureBlock = z.infer<typeof DrawSteelFeatureBlockZod>;
export type DrawSteelStatblock = z.infer<typeof DrawSteelStatblockZod>;
export type DrawSteelSkillCategory = z.infer<typeof DrawSteelSkillCategoryZod>;
export type DrawSteelSkillBlock = z.infer<typeof DrawSteelSkillBlockZod>;
export type DrawSteelImage = z.infer<typeof DrawSteelImageZod>;
export type DrawSteelProject = z.infer<typeof DrawSteelProjectZod>;
export type DrawSteelProjectBlock = z.infer<typeof DrawSteelProjectBlockZod>;
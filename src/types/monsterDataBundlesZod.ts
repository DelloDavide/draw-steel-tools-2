import z from "zod";
import {
  DrawSteelFeatureBlockZod,
  DrawSteelStatblockZod,
  DrawSteelSkillBlockZod,
} from "./DrawSteelZod";

export const PathBundleZod = z.strictObject({
  statblock: z.string(),
  features: z.array(z.string()),
  skills: z.array(z.string()).optional().default([]),
});
export const IndexBundleZod = z.strictObject({
  ...PathBundleZod.shape,
  name: z.string(),
  level: z.number(),
  ev: z.string(),
  roles: z.array(z.string()),
  ancestry: z.array(z.string()),
});

export const MonsterDataBundleZod = z.strictObject({
  key: z.string(),
  statblock: DrawSteelStatblockZod,
  featuresBlocks: z.array(DrawSteelFeatureBlockZod),
  skillsBlocks: z.array(DrawSteelSkillBlockZod).optional().default([]),
});
export type IndexBundle = z.infer<typeof IndexBundleZod>;
export type PathBundle = z.infer<typeof PathBundleZod>;
export type MonsterDataBundle = z.infer<typeof MonsterDataBundleZod>;

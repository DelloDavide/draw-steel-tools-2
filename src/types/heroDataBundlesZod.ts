import z from "zod";
import {
  DrawSteelFeatureBlockZod,
  DrawSteelStatblockZod,
  DrawSteelSkillBlockZod,
  DrawSteelImageZod,
  DrawSteelProjectBlockZod,
} from "./DrawSteelZod";

export const PathBundleZod = z.strictObject({
  statblock: z.string(),
  features: z.array(z.string()),
  skills: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  projectBlocks: z.array(z.string()).optional().default([]),
});
export const IndexBundleZod = z.strictObject({
  ...PathBundleZod.shape,
  name: z.string(),
  level: z.number(),
  ev: z.string(),
  roles: z.array(z.string()),
  ancestry: z.array(z.string()),
});

export const HeroDataBundleZod = z.strictObject({
  key: z.string(),
  statblock: DrawSteelStatblockZod,
  featuresBlocks: z.array(DrawSteelFeatureBlockZod),
  skillsBlocks: z.array(DrawSteelSkillBlockZod).optional().default([]),
  images: z.array(DrawSteelImageZod).optional().default([]),
  projectBlocks: z.array(DrawSteelProjectBlockZod).optional().default([]),
});
export type IndexBundle = z.infer<typeof IndexBundleZod>;
export type PathBundle = z.infer<typeof PathBundleZod>;
export type HeroDataBundle = z.infer<typeof HeroDataBundleZod>;

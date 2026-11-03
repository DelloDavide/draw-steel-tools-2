import z from "zod";
import {
  DrawSteelDynamicTerrainZod,
  DrawSteelFeatureBlockZod,
  DrawSteelImageZod,
  DrawSteelInventoryBlockZod,
  DrawSteelProjectBlockZod,
  DrawSteelSkillBlockZod,
  DrawSteelStatblockZod,
} from "./DrawSteelZod";

export const FeatureIndexBundleZod = z.strictObject({
  id: z.string(),
  path: z.string(),
  name: z.string(),
  type: z.literal("feature"),
});

export const StatblockIndexBundleZod = z.strictObject({
  id: z.string(),
  path: z.string(),
  name: z.string(),
  type: z.literal("statblock"),
  level: z.number(),
  ev: z.string(),
  roles: z.array(z.string()),
  ancestry: z.array(z.string()),
  features: z.array(z.string()),
});

export const TerrainIndexBundleZod = z.strictObject({
  id: z.string(),
  path: z.string(),
  name: z.string(),
  type: z.literal("terrain"),
  level: z.number(),
  ev: z.string(),
  roles: z.array(z.string()),
});

export const IndexBundleZod = z.union([
  FeatureIndexBundleZod,
  StatblockIndexBundleZod,
  TerrainIndexBundleZod,
]);

export const DrawSteelResourceZod = z.union([
  DrawSteelStatblockZod,
  DrawSteelDynamicTerrainZod,
  DrawSteelFeatureBlockZod,
]);

export const DrawSteelResourceBundleZod = z.strictObject({
  key: z.string(),
  resource: DrawSteelResourceZod,
  append: z.array(DrawSteelResourceZod).optional(),
});

export const MonsterDataBundleZod = z.strictObject({
  key: z.string(),
  statblock: DrawSteelStatblockZod,
  featuresBlocks: z.array(DrawSteelFeatureBlockZod),
  skillsBlocks: z.array(DrawSteelSkillBlockZod).optional().default([]),
  projectBlocks: z.array(DrawSteelProjectBlockZod).optional().default([]),
  images: z.array(DrawSteelImageZod).optional().default([]),
  inventoryBlocks: z.array(DrawSteelInventoryBlockZod).optional().default([]),
});

export type FeatureIndexBundle = z.infer<typeof FeatureIndexBundleZod>;
export type StatblockIndexBundle = z.infer<typeof StatblockIndexBundleZod>;
export type TerrainIndexBundle = z.infer<typeof TerrainIndexBundleZod>;
export type IndexBundle = z.infer<typeof IndexBundleZod>;
export type DrawSteelResource = z.infer<typeof DrawSteelResourceZod>;
export type DrawSteelResourceBundle = z.infer<
  typeof DrawSteelResourceBundleZod
>;
export type MonsterDataBundle = z.infer<typeof MonsterDataBundleZod>;

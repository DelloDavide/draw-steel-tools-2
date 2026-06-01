import z from "zod";
import { DrawSteelDynamicTerrainZod, DrawSteelImageZod } from "./DrawSteelZod";

export const DynamicTerrainIndexBundleZod = z.strictObject({
  statblock: z.string(),
  features: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  projectBlocks: z.array(z.string()).optional().default([]),
  name: z.string(),
  level: z.number(),
  ev: z.string(),
  roles: z.array(z.string()),
  ancestry: z.array(z.string()),
});

export const DynamicTerrainDataBundleZod = z.strictObject({
  key: z.string(),
  terrain: DrawSteelDynamicTerrainZod,
  images: z.array(DrawSteelImageZod).optional().default([]),
});

export type DynamicTerrainIndexBundle = z.infer<
  typeof DynamicTerrainIndexBundleZod
>;
export type DynamicTerrainDataBundle = z.infer<
  typeof DynamicTerrainDataBundleZod
>;

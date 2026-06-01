import type { IndexBundle } from "../types/monsterDataBundlesZod";

export function isDynamicTerrainIndexEntry(indexBundle: IndexBundle): boolean {
  return indexBundle.statblock.startsWith("Dynamic Terrain/");
}

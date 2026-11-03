import type { IndexBundle } from "../types/monsterDataBundlesZod";

export function isDynamicTerrainIndexEntry(indexBundle: IndexBundle): boolean {
  return indexBundle.type === "terrain";
}

import type { IndexBundle } from "../types/monsterDataBundlesZod";
import { getMonsterDataBundle } from "../statblockSearch/helpers/getMonsterDataBundle";
import { getDynamicTerrainDataBundle } from "../statblockSearch/helpers/getDynamicTerrainDataBundle";
import { isDynamicTerrainIndexEntry } from "./isDynamicTerrainIndexEntry";

export async function getIndexDataBundle(indexBundle: IndexBundle) {
  if (isDynamicTerrainIndexEntry(indexBundle)) {
    return getDynamicTerrainDataBundle(indexBundle);
  }
  return getMonsterDataBundle(indexBundle);
}
export function getIndexBundleStamina(
  bundle: Awaited<ReturnType<typeof getIndexDataBundle>>,
) {
  if ("terrain" in bundle) return bundle.terrain.stamina;
  return bundle.statblock.stamina;
}

export function getIndexBundleName(
  bundle: Awaited<ReturnType<typeof getIndexDataBundle>>,
) {
  if ("terrain" in bundle) return bundle.terrain.name;
  return bundle.statblock.name;
}

export function isIndexBundleMinion(
  bundle: Awaited<ReturnType<typeof getIndexDataBundle>>,
) {
  if ("terrain" in bundle) return false;
  return bundle.statblock.roles.join().toLowerCase().includes("minion");
}

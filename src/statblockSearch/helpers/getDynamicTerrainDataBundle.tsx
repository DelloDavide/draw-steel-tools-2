import { DrawSteelDynamicTerrainZod } from "../../types/DrawSteelZod";
import type { DynamicTerrainDataBundle } from "../../types/dynamicTerrainDataBundlesZod";
import type { IndexBundle } from "../../types/monsterDataBundlesZod";
import fetchTypedData from "./getTypedData";

export async function getDynamicTerrainDataBundle(
  indexBundle: Pick<IndexBundle, "statblock" | "name">,
): Promise<DynamicTerrainDataBundle> {
  const terrain = await fetchTypedData(
    indexBundle.statblock,
    DrawSteelDynamicTerrainZod.parse,
  );

  return {
    key: indexBundle.name,
    terrain,
    images: [],
  };
}

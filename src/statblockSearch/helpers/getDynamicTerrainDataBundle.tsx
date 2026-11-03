import { DrawSteelDynamicTerrainZod } from "../../types/DrawSteelZod";
import type { DynamicTerrainDataBundle } from "../../types/dynamicTerrainDataBundlesZod";
import type { DynamicTerrainIndexBundle } from "../../types/dynamicTerrainDataBundlesZod";
import fetchTypedData from "../devScriptButtons/helpers/fetchTypedData";

export async function getDynamicTerrainDataBundle(
  indexBundle: Pick<DynamicTerrainIndexBundle, "statblock" | "name">,
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

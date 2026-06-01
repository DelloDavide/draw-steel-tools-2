import dynamicTerrainIndex from "../statblockSearch/dynamicTerrainIndex.json";
import { getDynamicTerrainDataBundle } from "../statblockSearch/helpers/getDynamicTerrainDataBundle.tsx";
import type { IndexBundle } from "../types/monsterDataBundlesZod";

export const dynamicTerrainDataFromStatblockName = async (terrainId: string) => {
  const indexBundle = dynamicTerrainIndex.find((val) => val.name === terrainId);
  if (indexBundle === undefined) {
    throw new Error("Could not find statblock with name " + terrainId);
  }
  const normalizedIndexBundle: IndexBundle = {
    ...indexBundle,
    skills: indexBundle.skills ?? [],
    images: indexBundle.images ?? [],
    projectBlocks: indexBundle.projectBlocks ?? [],
  };
  return await getDynamicTerrainDataBundle(normalizedIndexBundle);
};

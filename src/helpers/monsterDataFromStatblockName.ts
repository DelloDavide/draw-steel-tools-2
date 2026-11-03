import { getMonsterDataBundle } from "../statblockSearch/devScriptButtons/helpers/getMonsterDataBundle";
import { monsterIndex } from "../statblockSearch/devScriptButtons/monsterIndex";
import { dynamicTerrainDataFromStatblockName } from "./dynamicTerrainDataFromStatblockName";
import { heroDataFromStatblockName } from "./heroDataFromStatblockName";
import type { CreatureDataBundle } from "../types/creatureDataBundle";
import type {
  DrawSteelResourceBundle,
  MonsterDataBundle,
} from "../types/monsterDataBundlesZod";

export async function dataFromBestiaryIndexId(
  idOrName: string,
): Promise<DrawSteelResourceBundle | CreatureDataBundle> {
  const indexBundle = monsterIndex.find(
    (entry) => entry.id === idOrName || entry.name === idOrName,
  );
  if (indexBundle) return getMonsterDataBundle(indexBundle);

  try {
    const heroData = await heroDataFromStatblockName(idOrName);
    return { ...heroData, kind: "hero" };
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.startsWith("Could not find statblock with name ")
    ) {
      throw error;
    }
  }

  const terrainData = await dynamicTerrainDataFromStatblockName(idOrName);
  return { ...terrainData, kind: "dynamicterrain" };
}

export async function monsterDataFromStatblockName(
  name: string,
): Promise<MonsterDataBundle> {
  const data = await dataFromBestiaryIndexId(name);
  if ("kind" in data) {
    if (data.kind === "monster") return data;
    throw new Error(`Could not find statblock with name ${name}`);
  }
  if (data.resource.type !== "statblock") {
    throw new Error(`Could not find statblock with name ${name}`);
  }
  const featuresBlocks = (data.append ?? []).filter(
    (resource) => resource.type === "featureblock",
  );
  return {
    key: data.key,
    statblock: data.resource,
    featuresBlocks,
    skillsBlocks: [],
    projectBlocks: [],
    images: [],
    inventoryBlocks: [],
  };
}

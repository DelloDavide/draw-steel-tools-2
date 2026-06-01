import {
  DrawSteelStatblockZod,
  DrawSteelFeatureBlockZod,
  DrawSteelSkillBlockZod,
} from "../../types/DrawSteelZod";
import type {
  IndexBundle,
  MonsterDataBundle,
} from "../../types/monsterDataBundlesZod";
import fetchTypedData from "./getTypedData";

export async function getMonsterDataBundle(
  indexBundle: IndexBundle,
): Promise<MonsterDataBundle> {
  const statblock = await fetchTypedData(
    indexBundle.statblock,
    DrawSteelStatblockZod.parse,
  );
  const featureBlocks = await Promise.all(
    indexBundle.features.map((path) =>
      fetchTypedData(path, DrawSteelFeatureBlockZod.parse),
    ),
  );
  const skillBlocks = await Promise.all(
    (indexBundle.skills ?? []).map((path) =>
      fetchTypedData(path, DrawSteelSkillBlockZod.parse),
    ),
  );

  return {
    key: indexBundle.name,
    statblock,
    featuresBlocks: featureBlocks,
    skillsBlocks: skillBlocks,
    images: [],
    projectBlocks: [],
  };
}

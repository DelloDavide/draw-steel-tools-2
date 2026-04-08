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
import getStatblockUrl from "./getStatblockUrl";

export async function getMonsterDataBundle(
  indexBundle: IndexBundle,
): Promise<MonsterDataBundle> {
  const statblockUrl = getStatblockUrl(indexBundle.statblock);
  const featureBLockUrls = indexBundle.features.map((item) =>
    getStatblockUrl(item),
  );
  const skillBlockUrls = (indexBundle.skills ?? []).map((item) =>
    getStatblockUrl(item),
  );

  const statblock = await fetchTypedData(
    statblockUrl,
    DrawSteelStatblockZod.parse,
  );
  const featureBlocks = await Promise.all(
    featureBLockUrls.map((item) =>
      fetchTypedData(item, DrawSteelFeatureBlockZod.parse),
    ),
  );
  const skillBlocks = await Promise.all(
    skillBlockUrls.map((item) =>
      fetchTypedData(item, DrawSteelSkillBlockZod.parse),
    ),
  );

  return {
    key: indexBundle.name,
    statblock,
    featuresBlocks: featureBlocks,
    skillsBlocks: skillBlocks,
  };
}

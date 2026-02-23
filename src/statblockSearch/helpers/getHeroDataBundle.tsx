import {
  DrawSteelStatblockZod,
  DrawSteelFeatureBlockZod,
} from "../../types/DrawSteelZod";
import type {
  IndexBundle,
  HeroDataBundle,
} from "../../types/heroDataBundlesZod.ts";
import fetchTypedData from "./getTypedData";
import getStatblockUrl from "./getStatblockUrl";

export async function getHeroDataBundle(
  indexBundle: IndexBundle,
): Promise<HeroDataBundle> {
  const statblockUrl = getStatblockUrl(indexBundle.statblock);
  const featureBLockUrls = indexBundle.features.map((item) =>
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

  return {
    key: indexBundle.name,
    statblock,
    featuresBlocks: featureBlocks,
  };
}

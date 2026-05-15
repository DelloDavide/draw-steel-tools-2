import {
  DrawSteelStatblockZod,
  DrawSteelFeatureBlockZod,
  DrawSteelSkillBlockZod,
  DrawSteelProjectBlockZod,
} from "../../types/DrawSteelZod";
import type {
  IndexBundle,
  HeroDataBundle,
} from "../../types/heroDataBundlesZod.ts";
import fetchTypedData from "./getTypedData";
import getStatblockUrl from "./getStatblockUrl";
import getImageUrl from "./getImageUrl";

export async function getHeroDataBundle(
  indexBundle: IndexBundle,
): Promise<HeroDataBundle> {
  const statblockUrl = getStatblockUrl(indexBundle.statblock);
  const featureBLockUrls = indexBundle.features.map((item) =>
    getStatblockUrl(item),
  );
  const skillBlockUrls = (indexBundle.skills ?? []).map((item) =>
    getStatblockUrl(item),
  );
  const imageBlockUrls = (indexBundle.images ?? []).map((item) =>
    getImageUrl(item),
  );
  const projectBlockUrls = (indexBundle.projectBlocks ?? []).map((item) =>
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
  const imageBlocks = imageBlockUrls.map((url) => ({
  type: "image" as const,
  src: url,
  }));
  const projectBlocks = await Promise.all(
    projectBlockUrls.map((item) =>
      fetchTypedData(item, DrawSteelProjectBlockZod.parse),
    ),
  );

  return {
    key: indexBundle.name,
    statblock,
    featuresBlocks: featureBlocks,
    skillsBlocks: skillBlocks,
    images: imageBlocks,
    projectBlocks: projectBlocks,
  };
}

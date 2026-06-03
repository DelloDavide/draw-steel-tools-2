import {
  DrawSteelStatblockZod,
  DrawSteelFeatureBlockZod,
  DrawSteelSkillBlockZod,
  DrawSteelProjectBlockZod,
  DrawSteelInventoryBlockZod,
} from "../../types/DrawSteelZod";
import type {
  IndexBundle,
  HeroDataBundle,
} from "../../types/heroDataBundlesZod.ts";
import fetchTypedData from "./getTypedData";
import getImageUrl from "./getImageUrl";

export async function getHeroDataBundle(
  indexBundle: IndexBundle,
): Promise<HeroDataBundle> {
  const imageBlockUrls = (indexBundle.images ?? []).map((item) =>
    getImageUrl(item),
  );

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
  const inventoryBlocks = await Promise.all(
    (indexBundle.inventoryBlocks ?? []).map((path) =>
      fetchTypedData(path, DrawSteelInventoryBlockZod.parse),
    ),
  );
  const imageBlocks = imageBlockUrls.map((url) => ({
  type: "image" as const,
  src: url,
  }));
  const projectBlocks = await Promise.all(
    (indexBundle.projectBlocks ?? []).map((path) =>
      fetchTypedData(path, DrawSteelProjectBlockZod.parse),
    ),
  );

  return {
    key: indexBundle.name,
    statblock,
    featuresBlocks: featureBlocks,
    skillsBlocks: skillBlocks,
    images: imageBlocks,
    projectBlocks: projectBlocks,
    inventoryBlocks: inventoryBlocks, // Inventory blocks are not included in the index bundle, so we return an empty array here.
  };
}

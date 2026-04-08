import heroIndex from "../statblockSearch/heroIndex.json";
import { getHeroDataBundle } from "../statblockSearch/helpers/getHeroDataBundle";
import type { IndexBundle } from "../types/heroDataBundlesZod";

export const heroDataFromStatblockName = async (heroId: string) => {
  const indexBundle = heroIndex.find((val) => val.name === heroId);
  if (indexBundle === undefined) {
    throw new Error("Could not find statblock with name " + heroId);
  }
  const normalizedIndexBundle: IndexBundle = {
    ...indexBundle,
    skills:
      "skills" in indexBundle && Array.isArray(indexBundle.skills)
        ? indexBundle.skills
        : [],
  };
  return await getHeroDataBundle(normalizedIndexBundle);
};

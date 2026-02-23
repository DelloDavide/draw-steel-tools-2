import heroIndex from "../statblockSearch/heroIndex.json";
import { getHeroDataBundle } from "../statblockSearch/helpers/getHeroDataBundle";

export const heroDataFromStatblockName = async (heroId: string) => {
  const indexBundle = heroIndex.find((val) => val.name === heroId);
  if (indexBundle === undefined) {
    throw new Error("Could not find statblock with name " + heroId);
  }
  return await getHeroDataBundle(indexBundle);
};

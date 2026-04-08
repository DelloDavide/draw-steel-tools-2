import monsterIndex from "../statblockSearch/monsterIndex.json";
import { getMonsterDataBundle } from "../statblockSearch/helpers/getMonsterDataBundle.tsx";
import type { IndexBundle } from "../types/monsterDataBundlesZod";

export const monsterDataFromStatblockName = async (monsterId: string) => {
  const indexBundle = monsterIndex.find((val) => val.name === monsterId);
  if (indexBundle === undefined) {
    throw new Error("Could not find statblock with name " + monsterId);
  }
  const normalizedIndexBundle: IndexBundle = {
    ...indexBundle,
    skills:
      "skills" in indexBundle && Array.isArray(indexBundle.skills)
        ? indexBundle.skills
        : [],
  };
  return await getMonsterDataBundle(normalizedIndexBundle);
};

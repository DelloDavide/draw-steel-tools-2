import type { IndexBundle } from "../../types/monsterDataBundlesZod";
import monsterIndexJson from "./monsterIndex.json";

export const monsterIndex = monsterIndexJson as IndexBundle[];

export const statblockKeywords = [
  ...new Set(
    monsterIndex
      .filter((val) => val.type === "statblock")
      .flatMap((val) => val.ancestry),
  ),
]
  .filter((val) => val !== "Human or Animal")
  .sort((a, b) => a.localeCompare(b));

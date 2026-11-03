import type { IndexBundle } from "../types/monsterDataBundlesZod";
import { getMonsterDataBundle } from "../statblockSearch/devScriptButtons/helpers/getMonsterDataBundle";

export async function getIndexDataBundle(indexBundle: IndexBundle) {
  return getMonsterDataBundle(indexBundle);
}
export function getIndexBundleStamina(
  bundle: Awaited<ReturnType<typeof getIndexDataBundle>>,
) {
  if ("stamina" in bundle.resource) return bundle.resource.stamina;
  throw new Error("The selected resource does not have stamina.");
}

export function getIndexBundleName(
  bundle: Awaited<ReturnType<typeof getIndexDataBundle>>,
) {
  return bundle.resource.name;
}

export function isIndexBundleMinion(
  bundle: Awaited<ReturnType<typeof getIndexDataBundle>>,
) {
  return (
    bundle.resource.type === "statblock" &&
    bundle.resource.roles.join().toLowerCase().includes("minion")
  );
}

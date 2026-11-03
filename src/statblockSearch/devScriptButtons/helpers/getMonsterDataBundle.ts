import { DrawSteelFeatureBlockZod } from "../../../types/DrawSteelZod";
import {
  DrawSteelResourceZod,
  type DrawSteelResource,
  type DrawSteelResourceBundle,
  type IndexBundle,
} from "../../../types/monsterDataBundlesZod";
import fetchTypedData from "./fetchTypedData";
import { monsterIndex } from "../monsterIndex";

export async function getMonsterDataBundle(
  indexBundle: IndexBundle,
): Promise<DrawSteelResourceBundle> {
  const fetches: Promise<DrawSteelResource>[] = [];
  fetches.push(fetchTypedData(indexBundle.path, DrawSteelResourceZod.parse));

  if (indexBundle.type === "statblock") {
    const featurePaths = indexBundle.features.map((id) => {
      const item = monsterIndex.find((item) => item.id === id);
      if (!item) throw new Error(`Feature resource not found for id "${id}"`);
      return item.path;
    });

    fetches.push(
      ...featurePaths.map((path) => {
        return fetchTypedData(path, DrawSteelFeatureBlockZod.parse);
      }),
    );
  }

  const results = await Promise.all(fetches);

  const [resource, ...append] = results;

  return {
    key: indexBundle.id,
    resource,
    append,
  };
}

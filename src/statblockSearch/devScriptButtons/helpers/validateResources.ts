import {
  DrawSteelDynamicTerrainZod,
  DrawSteelFeatureBlockZod,
  DrawSteelStatblockZod,
} from "../../../types/DrawSteelZod";
import type { IndexBundle } from "../../../types/monsterDataBundlesZod";
import getBestiaryUrl from "./getBestiaryUrl";

export async function validateResources(indexBundles: IndexBundle[]) {
  const badStatblocks: { file: string; errors: unknown }[] = [];
  await Promise.all(
    indexBundles.map(async (bundle) => {
      // Get
      const response = await fetch(getBestiaryUrl(bundle.path));
      const json = await response.json();

      // Validate
      if (bundle.type === "statblock") {
        const result = DrawSteelStatblockZod.safeParse(json);
        if (!result.success) {
          badStatblocks.push({
            file: bundle.path,
            errors: result.error,
          });
        }
      } else if (bundle.type === "feature") {
        const result = DrawSteelFeatureBlockZod.safeParse(json);
        if (!result.success) {
          badStatblocks.push({
            file: bundle.path,
            errors: result.error,
          });
        }
      } else {
        const result = DrawSteelDynamicTerrainZod.safeParse(json);
        if (!result.success) {
          badStatblocks.push({
            file: bundle.path,
            errors: result.error,
          });
        }
      }
    }),
  );

  if (badStatblocks.length > 0) console.error(badStatblocks);
  else console.log("All statblock pass validation");

  alert("Check console for audit details");
}

import { DrawSteelStatblockZod } from "../../types/DrawSteelZod";
import type { PathBundle } from "../../types/monsterDataBundlesZod";
import fetchTypedData from "../helpers/getTypedData";

export async function validateStatblocks(pathBundles: PathBundle[]) {
  const badStatblocks: { file: string; errors: unknown }[] = [];
  await Promise.all(
    pathBundles.map(async (bundle) => {
      try {
        await fetchTypedData(bundle.statblock, (value) => {
          const result = DrawSteelStatblockZod.safeParse(value);
          if (!result.success) {
            badStatblocks.push({
              file: bundle.statblock,
              errors: result.error,
            });
          }
          return value;
        });
      } catch (err) {
        badStatblocks.push({
          file: bundle.statblock,
          errors: err,
        });
      }
    }),
  );

  if (badStatblocks.length > 0) console.error(badStatblocks);
  else console.log("All statblock pass validation");

  alert("Check console for audit details");
}

import { DrawSteelFeatureBlockZod } from "../../types/DrawSteelZod";
import type { PathBundle } from "../../types/monsterDataBundlesZod";
import fetchTypedData from "../helpers/getTypedData";

export async function validateMalice(
  pathBundles: PathBundle[],
  handleBadStatblocks?: (paths: string[]) => void,
) {
  const badStatblocks: {
    file: string;
    errors: unknown;
  }[] = [];
  await Promise.all(
    pathBundles
      .map((val) => val.features)
      .map(async (features) => {
        await Promise.all(
          features.map(async (featurePath) => {
            await fetchTypedData(featurePath, (value) => {
              const result = DrawSteelFeatureBlockZod.safeParse(value);
              if (!result.success) {
                badStatblocks.push({
                  file: featurePath,
                  errors: result.error,
                });
              }
              return value;
            });
          }),
        );
      }),
  );

  const noRepeats = [...new Set(badStatblocks)];
  if (noRepeats.length > 0) console.error(noRepeats);
  else console.log("All malice pass validation");
  if (handleBadStatblocks) {
    handleBadStatblocks([...noRepeats].map((val) => val.file));
  }

  alert("Check console for audit details");
}

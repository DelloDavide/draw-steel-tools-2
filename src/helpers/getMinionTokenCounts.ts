import { type Item } from "@owlbear-rodeo/sdk";
import type { MinionGroup } from "../types/minionGroup";
import { checkItemIsValidPluginType } from "./pluginTargetValidityChecking";
import { TOKEN_METADATA_KEY } from "./tokenHelpers";
import type { MinionTokenData } from "../types/tokenDataZod";

export type TokenCounts = {
  [groupId: string]: number;
};

export function getMinionTokenCounts(
  items: Item[],
  minionGroups: MinionGroup[],
  currentCounts?: TokenCounts,
): { changed: boolean; counts: TokenCounts } {
  const counts: { [groupId: string]: number } = {};

  // This is supposed to be fast
  for (const item of items) {
    const itemData = item.metadata?.[TOKEN_METADATA_KEY] as
      | Partial<MinionTokenData>
      | undefined;
    const type = itemData?.type;
    const itemGroupId = itemData?.groupId;

    if (
      type === "MINION" &&
      itemGroupId &&
      checkItemIsValidPluginType(item, "MINION")
    ) {
      for (const group of minionGroups) {
        if (itemGroupId === group.id) {
          if (group.id in counts) {
            counts[group.id]++;
          } else {
            counts[group.id] = 1;
          }
        }
      }
    }
  }

  if (currentCounts === undefined) return { changed: true, counts };

  if (Object.keys(currentCounts).length !== Object.keys(counts).length) {
    return { changed: true, counts };
  }
  for (const minionGroup of minionGroups) {
    if (counts[minionGroup.id] !== currentCounts[minionGroup.id]) {
      return { changed: true, counts };
    }
  }

  return { changed: false, counts };
}

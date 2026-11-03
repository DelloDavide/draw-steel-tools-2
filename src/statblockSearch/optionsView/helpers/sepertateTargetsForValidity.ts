import type { Item } from "@owlbear-rodeo/sdk";
import {
  checkItemIsValidPluginType,
  type PluginItemType,
} from "../../../helpers/pluginTargetValidityChecking";

export function sepertateTargetsForValidity(
  type: PluginItemType | undefined,
  items: Item[],
) {
  if (type === undefined) return { validTargets: [], invalidTargets: items };

  const validTargets: Item[] = [];
  const invalidTargets: Item[] = [];

  items.forEach((item) => {
    if (checkItemIsValidPluginType(item, type)) validTargets.push(item);
    else invalidTargets.push(item);
  });

  return { validTargets, invalidTargets };
}

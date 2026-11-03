import { type Item } from "@owlbear-rodeo/sdk";
import { parseTokenData } from "../../helpers/tokenHelpers";
import type {
  Catagory,
  ObrState,
  UpdateBundle,
  ChangedData,
  PreviousItemData,
} from "../types";
import type { DefinedCharacterTokenData } from "../../types/tokenDataZod";
import {
  checkNeedsRefresh,
  checkItemChanges,
  checkMetadataChanges,
} from "./checkChanges";
import { getValidPluginTypes } from "../../helpers/pluginTargetValidityChecking";
import { checkHasPluginData } from "../../helpers/checkHasPluginData";

function bundleCatagory(
  cat: Catagory,
  item: Item,
  data?: DefinedCharacterTokenData,
  prev?: PreviousItemData,
): UpdateBundle {
  if (cat === "UNTRACKED" || cat === "REMOVE") return { item, type: cat };
  if (!data) throw new Error(`Data was not provided for bundle type ${cat}`);
  if (cat === "ADD") return { item, type: cat, data };
  if (!prev)
    throw new Error(`Previous data was not provided for bundle type ${cat}`);
  return { item, type: cat, data, prev };
}

export function getUpdateBundles(
  obrState: ObrState,
  changed: ChangedData,
): UpdateBundle[] {
  const items = changed.items ? changed.items : obrState.items;

  return items.map((item: Item) => {
    const log = obrState.attachmentLogs[item.id];
    const prev: PreviousItemData | undefined = log
      ? { item: log.item, data: log.data }
      : undefined;

    const hasMetadata = checkHasPluginData(item);
    if (!hasMetadata)
      return bundleCatagory(prev ? "REMOVE" : "UNTRACKED", item);

    const validPluginItemTypes = getValidPluginTypes(item);

    if (validPluginItemTypes.length === 0)
      return bundleCatagory(prev ? "REMOVE" : "UNTRACKED", item);

    const data = parseTokenData(item.metadata);

    // Mismatch between metadata and valid target types
    if (!validPluginItemTypes.includes(data.type))
      return bundleCatagory(prev ? "REMOVE" : "UNTRACKED", item);

    if (!prev) return bundleCatagory("ADD", item, data);

    if (changed.settings) return bundleCatagory("UPDATE", item, data, prev);
    if (changed.role) return bundleCatagory("UPDATE", item, data, prev);
    if (changed.minions && data.type === "MINION")
      return bundleCatagory("UPDATE", item, data, prev);

    if (item.lastModified <= prev.item.lastModified)
      return bundleCatagory("UNCHANGED", item, data, prev);
    if (checkNeedsRefresh(item, prev.item, obrState.settings.nameTagsEnabled))
      return bundleCatagory("REFRESH", item, data, prev);
    if (checkItemChanges(item, prev.item))
      return bundleCatagory("UPDATE", item, data, prev);
    if (checkMetadataChanges(data, prev.data))
      return bundleCatagory("UPDATE", item, data, prev);

    return bundleCatagory("UNCHANGED", item, data, prev);
  });
}

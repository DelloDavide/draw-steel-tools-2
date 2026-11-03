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
  const items = changed.items ?? obrState.items;

  return items.map((item) => getItemBundle(item, obrState, changed));
}

function getItemBundle(
  item: Item,
  obrState: ObrState,
  changed: ChangedData,
): UpdateBundle {
  const log = obrState.attachmentLogs[item.id];
  const prev: PreviousItemData | undefined = log
    ? { item: log.item, data: log.data }
    : undefined;

  const hasMetadata = checkHasPluginData(item);
  if (!hasMetadata) return bundleCatagory(prev ? "REMOVE" : "UNTRACKED", item);

  const validPluginItemTypes = getValidPluginTypes(item);

  if (validPluginItemTypes.length === 0)
    return bundleCatagory(prev ? "REMOVE" : "UNTRACKED", item);

  const data = parseTokenData(item.metadata);

  // Mismatch between metadata and valid target types
  if (!validPluginItemTypes.includes(data.type))
    return bundleCatagory(prev ? "REMOVE" : "UNTRACKED", item);

  if (!prev) return bundleCatagory("ADD", item, data);

  return bundleCatagory(
    getTrackedCatagory(item, data, prev, obrState, changed),
    item,
    data,
    prev,
  );
}

function getTrackedCatagory(
  item: Item,
  data: DefinedCharacterTokenData,
  prev: PreviousItemData,
  obrState: ObrState,
  changed: ChangedData,
): "UPDATE" | "REFRESH" | "UNCHANGED" {
  if (
    changed.settings ||
    changed.role ||
    (changed.minions && data.type === "MINION")
  )
    return "UPDATE";
  if (item.lastModified <= prev.item.lastModified) return "UNCHANGED";
  if (checkNeedsRefresh(item, prev.item, obrState.settings.nameTagsEnabled))
    return "REFRESH";
  if (checkItemChanges(item, prev.item)) return "UPDATE";
  if (checkMetadataChanges(data, prev.data)) return "UPDATE";

  return "UNCHANGED";
}

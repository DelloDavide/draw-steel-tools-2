import type { Item } from "@owlbear-rodeo/sdk";
import { hpTextId } from "../overlays/compoundItemHelpers";
import { getTokenOverlay } from "../overlays/getTokenOverlay";
import type { UpdateBundle, ObrState, AttachmentLogs } from "../types";
import { setDifference } from "../../helpers/setDifference";

function getLeftoverAttatchementIds(
  itemId: string,
  attachmentIds: string[],
  attachmentLogs: AttachmentLogs,
): string[] | undefined {
  const attachmentLog = attachmentLogs[itemId];
  if (!attachmentLog) return;
  return setDifference(attachmentLog.attachmentIds, attachmentIds);
}

export function processUpdateBundles(
  updateBundles: UpdateBundle[],
  obrState: ObrState,
) {
  const addItemsArray: Item[] = [];
  const deleteItemsArray: string[] = [];
  const newAttachmentLogs: AttachmentLogs = {};

  // Debug
  // console.log("--------");
  // console.log(
  //   "ADD",
  //   updateBundles.filter((item) => item.type === "ADD").length,
  // );
  // console.log(
  //   "REFRESH",
  //   updateBundles.filter((item) => item.type === "REFRESH").length,
  // );
  // console.log(
  //   "REMOVE",
  //   updateBundles.filter((item) => item.type === "REMOVE").length,
  // );
  // console.log(
  //   "UNCHANGED",
  //   updateBundles.filter((item) => item.type === "UNCHANGED").length,
  // );
  // console.log(
  //   "UNTRACKED",
  //   updateBundles.filter((item) => item.type === "UNTRACKED").length,
  // );
  // console.log(
  //   "UPDATE",
  //   updateBundles.filter((item) => item.type === "UPDATE").length,
  // );

  updateBundles
    .filter(
      (bundle) =>
        bundle.type === "UPDATE" ||
        bundle.type === "REFRESH" ||
        bundle.type === "ADD",
    )
    .forEach((bundle) => {
      if (bundle.type === "REFRESH") {
        deleteItemsArray.push(hpTextId(bundle.item.id));
      }

      const attachments = getTokenOverlay(bundle.item, bundle.data, obrState);
      addItemsArray.push(...attachments);
      const attachmentIds = attachments.map((value) => value.id);

      newAttachmentLogs[bundle.item.id] = {
        item: bundle.item,
        attachmentIds,
        data: bundle.data,
      };

      if (bundle.type === "ADD") return;

      const leftoverIds = getLeftoverAttatchementIds(
        bundle.item.id,
        attachmentIds,
        obrState.attachmentLogs,
      );
      if (leftoverIds) deleteItemsArray.push(...leftoverIds);
    });

  updateBundles
    .filter((bundle) => bundle.type === "UNCHANGED")
    .forEach((bundle) => {
      newAttachmentLogs[bundle.item.id] =
        obrState.attachmentLogs[bundle.item.id];
    });

  updateBundles
    .filter((bundle) => bundle.type === "REMOVE")
    .forEach((bundle) => {
      const ids = obrState.attachmentLogs[bundle.item.id]?.attachmentIds;
      if (ids) deleteItemsArray.push(...ids);
    });

  // Untracked bundles are ignored, no action is required

  return { addItemsArray, deleteItemsArray, newAttachmentLogs };
}

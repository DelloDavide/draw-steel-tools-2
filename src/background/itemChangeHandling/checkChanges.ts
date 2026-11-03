import {
  isImage,
  isShape,
  type Image,
  type Item,
  type Shape,
} from "@owlbear-rodeo/sdk";
import type { DefinedCharacterTokenData } from "../../types/tokenDataZod";

export function checkNeedsRefresh(
  item: Item,
  prev: Item,
  nameTagsEnabled: boolean,
) {
  if (prev.scale.x !== item.scale.x) return true;
  if (prev.scale.y !== item.scale.y) return true;
  if (prev.name !== item.name && nameTagsEnabled) return true;
  return false;
}

export function checkItemChanges(item: Item, prev: Item) {
  if (prev.layer !== item.layer) return true;
  if (prev.position.x !== item.position.x) return true;
  if (prev.position.y !== item.position.y) return true;
  if (prev.visible !== item.visible) return true;
  if (isImage(item) && isImage(prev)) return checkImageGridChanges(item, prev);
  if (isShape(item) && isShape(prev)) return checkShapeSizeChanges(item, prev);
  return false;
}

function checkImageGridChanges(item: Image, prev: Image) {
  return (
    prev.grid.offset.x !== item.grid.offset.x ||
    prev.grid.offset.y !== item.grid.offset.y ||
    prev.grid.dpi !== item.grid.dpi
  );
}

function checkShapeSizeChanges(item: Shape, prev: Shape) {
  return prev.height !== item.height || prev.width !== item.width;
}

type NamedTokenData = Exclude<DefinedCharacterTokenData, { type: "MINION" }>;

function checkNamedTokenChanges(item: NamedTokenData, prev: NamedTokenData) {
  return (
    item.name !== prev.name ||
    item.gmOnly !== prev.gmOnly ||
    item.stamina !== prev.stamina ||
    item.staminaMaximum !== prev.staminaMaximum
  );
}

export function checkMetadataChanges(
  item: DefinedCharacterTokenData,
  prev: DefinedCharacterTokenData,
) {
  if (item.type !== prev.type) return true;
  if (item.type === "HERO" && prev.type === "HERO") {
    return (
      checkNamedTokenChanges(item, prev) ||
      item.temporaryStamina !== prev.temporaryStamina ||
      item.heroicResource !== prev.heroicResource ||
      item.surges !== prev.surges
    );
  }
  if (item.type === "MONSTER" && prev.type === "MONSTER") {
    return (
      checkNamedTokenChanges(item, prev) ||
      item.temporaryStamina !== prev.temporaryStamina
    );
  }
  if (item.type === "TERRAIN" && prev.type === "TERRAIN") {
    return checkNamedTokenChanges(item, prev);
  }
  if (item.type === "MINION" && prev.type === "MINION") {
    return item.groupId !== prev.groupId;
  }

  return false;
}

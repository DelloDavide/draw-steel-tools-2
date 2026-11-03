import { isImage, isShape, type Item } from "@owlbear-rodeo/sdk";
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
  if (isImage(item) && isImage(prev)) {
    if (prev.grid.offset.x !== item.grid.offset.x) return true;
    if (prev.grid.offset.y !== item.grid.offset.y) return true;
    if (prev.grid.dpi !== item.grid.dpi) return true;
  }
  if (isShape(item) && isShape(prev)) {
    if (prev.height !== item.height) return true;
    if (prev.width !== item.width) return true;
  }
  return false;
}

export function checkMetadataChanges(
  item: DefinedCharacterTokenData,
  prev: DefinedCharacterTokenData,
) {
  if (item.type !== prev.type) return true;
  if (item.type === "HERO" && prev.type === "HERO") {
    if (item.name !== prev.name) return true;
    if (item.gmOnly !== prev.gmOnly) return true;
    if (item.stamina !== prev.stamina) return true;
    if (item.staminaMaximum !== prev.staminaMaximum) return true;
    if (item.temporaryStamina !== prev.temporaryStamina) return true;
    if (item.heroicResource !== prev.heroicResource) return true;
    if (item.surges !== prev.surges) return true;
  }
  if (item.type === "MONSTER" && prev.type === "MONSTER") {
    if (item.name !== prev.name) return true;
    if (item.gmOnly !== prev.gmOnly) return true;
    if (item.stamina !== prev.stamina) return true;
    if (item.staminaMaximum !== prev.staminaMaximum) return true;
    if (item.temporaryStamina !== prev.temporaryStamina) return true;
  }
  if (item.type === "TERRAIN" && prev.type === "TERRAIN") {
    if (item.name !== prev.name) return true;
    if (item.gmOnly !== prev.gmOnly) return true;
    if (item.stamina !== prev.stamina) return true;
    if (item.staminaMaximum !== prev.staminaMaximum) return true;
  }
  if (item.type === "MINION" && prev.type === "MINION") {
    if (item.groupId !== prev.groupId) return true;
  }

  return false;
}

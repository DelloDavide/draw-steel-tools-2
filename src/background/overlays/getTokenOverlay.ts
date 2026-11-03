import type { Item } from "@owlbear-rodeo/sdk";
import type { DefinedCharacterTokenData } from "../../types/tokenDataZod";
import { createHeroOverlay } from "./createHeroOverlay";
import { createMinionOverlay } from "./createMinionOverlay";
import { createMonsterOverlay } from "./createMonsterOverlay";
import { createTerrainOverlay } from "./createTerrainOverlay";
import type { ObrState } from "../types";

export function getTokenOverlay(
  item: Item,
  data: DefinedCharacterTokenData,
  obrState: ObrState,
) {
  if (data.type === "MONSTER")
    return createMonsterOverlay(
      item,
      data,
      obrState.playerRole,
      obrState.sceneDpi,
      obrState.settings,
    );
  if (data.type === "MINION")
    return createMinionOverlay(
      item,
      data,
      obrState.minionGroups,
      obrState.playerRole,
      obrState.sceneDpi,
      obrState.settings,
      obrState.minionTokenCounts,
    );
  if (data.type === "TERRAIN")
    return createTerrainOverlay(
      item,
      data,
      obrState.playerRole,
      obrState.sceneDpi,
      obrState.settings,
    );
  return createHeroOverlay(
    item,
    data,
    obrState.playerRole,
    obrState.sceneDpi,
    obrState.settings,
  );
}

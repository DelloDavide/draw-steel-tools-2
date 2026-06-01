import OBR from "@owlbear-rodeo/sdk";
import { parseTokenData, TOKEN_METADATA_KEY } from "./tokenHelpers";
import type { DefinedHeroTokenData } from "../types/tokenDataZod";
import { updateClassResourcePool } from "./classResourceHelpers";

export async function updateHeroTokenClassResource(
  itemId: string,
  resourceName: string,
  value: number,
) {
  const items = await OBR.scene.items.getItems((item) => item.id === itemId);
  if (items.length !== 1) return;

  const token = parseTokenData(items[0].metadata);
  if (token.type !== "HERO") return;

  await OBR.scene.items.updateItems(
    (item) => item.id === itemId,
    (selected) => {
      if (selected.length !== 1) return;
      const current = parseTokenData(selected[0].metadata);
      if (current.type !== "HERO") return;

      selected[0].metadata = {
        ...selected[0].metadata,
        [TOKEN_METADATA_KEY]: {
          ...current,
          ...updateClassResourcePool(current, resourceName, value),
        } satisfies DefinedHeroTokenData,
      };
    },
  );
}

export async function findHeroTokenForStatblock(
  statblockName: string,
  preferredItemId?: string | null,
): Promise<{ itemId: string; token: DefinedHeroTokenData } | undefined> {
  const items = await OBR.scene.items.getItems();

  if (preferredItemId) {
    const preferred = items.find((item) => item.id === preferredItemId);
    if (preferred) {
      const token = parseTokenData(preferred.metadata);
      if (
        token.type === "HERO" &&
        token.statblockName === statblockName
      ) {
        return { itemId: preferred.id, token };
      }
    }
  }

  for (const item of items) {
    const token = parseTokenData(item.metadata);
    if (token.type === "HERO" && token.statblockName === statblockName) {
      return { itemId: item.id, token };
    }
  }

  return undefined;
}

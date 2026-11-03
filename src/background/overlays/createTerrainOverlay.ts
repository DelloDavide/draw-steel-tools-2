import type { Item } from "@owlbear-rodeo/sdk";
import type { DefinedTerrainTokenData } from "../../types/tokenDataZod";

import type { DefinedSettings } from "../../types/settingsZod";
import { createTokenOverlay } from "./createTokenOverlay";

export function createTerrainOverlay(
  item: Item,
  token: DefinedTerrainTokenData,
  role: "PLAYER" | "GM",
  dpi: number,
  settings: DefinedSettings,
): Item[] {
  return createTokenOverlay(
    {
      bars: [
        {
          value: token.stamina,
          maximum: token.staminaMaximum,
          display:
            token.staminaMaximum > 0 &&
            (role === "GM" || !token.gmOnly || settings.showHealthBars),
          lightBackground: !token.gmOnly,
          segments:
            role === "PLAYER" && token.gmOnly && settings.showHealthBars
              ? settings.segmentsCount
              : 0,
          variant:
            role === "PLAYER" && token.gmOnly && settings.showHealthBars
              ? "short"
              : "full",
        },
      ],
      nameTags: [
        {
          text: token.name,
          display: settings.nameTagsEnabled && token.name !== "",
        },
      ],
    },
    item,
    dpi,
    settings,
  );
}

import type { Image, Item } from "@owlbear-rodeo/sdk";
import type { DefinedHeroTokenData } from "../../types/tokenDataZod";

import type { DefinedSettings } from "../../types/settingsZod";
import { createTokenOverlay } from "./createTokenOverlay";
import {
  classResourceColor,
  getMergedClassResourcePools,
} from "../../helpers/classResourceHelpers";

export function createHeroOverlay(
  image: Image,
  token: DefinedHeroTokenData,
  role: "PLAYER" | "GM",
  dpi: number,
  settings: DefinedSettings,
): Item[] {
  const classResourcePools = getMergedClassResourcePools(token);
  const classResourceBubbles = Object.entries(classResourcePools)
    .filter(([, value]) => value !== 0)
    .map(([name, value]) => ({
      color: classResourceColor(name),
      value,
      display: role === "GM" || !token.gmOnly,
    }));

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
      bubbles: [
        {
          color: "darkgoldenrod",
          value: token.surges,
          display: (role === "GM" || !token.gmOnly) && token.surges > 0,
        },
        ...classResourceBubbles,
        {
          color: "olivedrab",
          value: token.temporaryStamina,
          display:
            (role === "GM" || !token.gmOnly) && token.temporaryStamina > 0,
        },
      ],
      nameTags: [
        {
          text: token.name,
          display: settings.nameTagsEnabled && token.name !== "",
        },
      ],
    },
    image,
    dpi,
    settings,
  );
}

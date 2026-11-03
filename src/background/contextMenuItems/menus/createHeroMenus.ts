import OBR, { type ContextMenuItem, type KeyFilter } from "@owlbear-rodeo/sdk";
import { getContextMenuUrl } from "../../../helpers/getContextMenuUrl";
import { getPluginId } from "../../../helpers/getPluginId";
import { TOKEN_METADATA_KEY } from "../../../helpers/tokenHelpers";
import {
  NAME_HEIGHT,
  HERO_STATS_HEIGHT,
  VERTICAL_PADDING,
  ACCESS_TOGGLE_HEIGHT,
} from "./constants";
import knightHelmetIcon from "../icons/knightHelmetIcon";
import type { ThemeMode } from "../../../types/themeMode";

function buildHeroMenu(
  themeMode: ThemeMode,
  nameTagsEnabled: boolean,
  variant: "GM" | "PLAYER",
): ContextMenuItem {
  const isGm = variant === "GM";

  const every: KeyFilter[] = [
    { key: "layer", value: "CHARACTER", coordinator: "||" },
    { key: "layer", value: "MOUNT" },
    { key: "type", value: "IMAGE" },
    {
      key: ["metadata", TOKEN_METADATA_KEY, "type"],
      operator: "!=",
      value: "MONSTER",
    },
    {
      key: ["metadata", TOKEN_METADATA_KEY, "type"],
      operator: "!=",
      value: "MINION",
    },
    {
      key: ["metadata", TOKEN_METADATA_KEY, "type"],
      operator: "!=",
      value: "TERRAIN",
    },
    {
      key: ["metadata", TOKEN_METADATA_KEY],
      operator: "!=",
      value: undefined,
    },
  ];

  if (!isGm) {
    every.push({
      key: ["metadata", TOKEN_METADATA_KEY, "gmOnly"],
      operator: "!=",
      value: true,
    });
  }

  return {
    id: getPluginId(isGm ? "gm-menu-hero" : "player-menu-hero"),
    icons: [
      {
        icon: knightHelmetIcon,
        label: "Edit Hero",
        filter: {
          every,
          permissions: isGm ? undefined : ["UPDATE"],
          roles: [variant],
          max: 1,
        },
      },
    ],
    embed: {
      url: getContextMenuUrl(themeMode),
      height:
        (nameTagsEnabled ? NAME_HEIGHT : 0) +
        HERO_STATS_HEIGHT +
        VERTICAL_PADDING +
        (isGm ? ACCESS_TOGGLE_HEIGHT : 0),
    },
  };
}

export function createHeroMenu(themeMode: ThemeMode, nameTagsEnabled: boolean) {
  OBR.contextMenu.create(buildHeroMenu(themeMode, nameTagsEnabled, "GM"));
  OBR.contextMenu.create(buildHeroMenu(themeMode, nameTagsEnabled, "PLAYER"));
}

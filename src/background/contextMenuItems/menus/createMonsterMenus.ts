import OBR, { type ContextMenuItem, type KeyFilter } from "@owlbear-rodeo/sdk";
import { getContextMenuUrl } from "../../../helpers/getContextMenuUrl";
import { getPluginId } from "../../../helpers/getPluginId";
import { TOKEN_METADATA_KEY } from "../../../helpers/tokenHelpers";
import {
  NAME_HEIGHT,
  VERTICAL_PADDING,
  ACCESS_TOGGLE_HEIGHT,
  MONSTER_STATS_HEIGHT,
} from "./constants";
import type { ThemeMode } from "../../../types/themeMode";
import dragonHeadIcon from "../icons/dragonHeadIcon";

function buildMonsterMenu(
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
      operator: "==",
      value: "MONSTER",
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
    id: getPluginId(isGm ? "gm-menu-monster" : "player-menu-monster"),
    icons: [
      {
        icon: dragonHeadIcon,
        label: "Edit Monster",
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
        MONSTER_STATS_HEIGHT +
        VERTICAL_PADDING +
        (isGm ? ACCESS_TOGGLE_HEIGHT : 0),
    },
  };
}

export function createMonsterMenu(
  themeMode: ThemeMode,
  nameTagsEnabled: boolean,
) {
  OBR.contextMenu.create(buildMonsterMenu(themeMode, nameTagsEnabled, "GM"));
  OBR.contextMenu.create(
    buildMonsterMenu(themeMode, nameTagsEnabled, "PLAYER"),
  );
}

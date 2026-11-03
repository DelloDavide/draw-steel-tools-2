import OBR, {
  type ContextMenuIcon,
  type ContextMenuItem,
  type KeyFilter,
} from "@owlbear-rodeo/sdk";
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
import landPlotIcon from "../icons/landPlotIcon";

function getIcon(
  layerTypeFilters: KeyFilter[],
  variant: "GM" | "PLAYER",
): ContextMenuIcon {
  const isGm = variant === "GM";

  const every: KeyFilter[] = [
    ...layerTypeFilters,
    {
      key: ["metadata", TOKEN_METADATA_KEY, "type"],
      operator: "==",
      value: "TERRAIN",
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
    icon: landPlotIcon,
    label: "Edit Terrain",
    filter: {
      every,
      permissions: isGm ? undefined : ["UPDATE"],
      roles: [variant],
      max: 1,
    },
  };
}

function buildTerrainMenu(
  themeMode: ThemeMode,
  nameTagsEnabled: boolean,
  variant: "GM" | "PLAYER",
): ContextMenuItem {
  const isGm = variant === "GM";

  return {
    id: getPluginId(isGm ? "gm-menu-terrain" : "player-menu-terrain"),
    icons: [
      getIcon(
        [
          { key: "type", value: "SHAPE", coordinator: "||" },
          { key: "type", value: "CURVE" },
          { key: "layer", value: "DRAWING" },
        ],
        variant,
      ),
      getIcon(
        [
          { key: "type", value: "IMAGE", coordinator: "||" },
          { key: "type", value: "SHAPE", coordinator: "||" },
          { key: "type", value: "CURVE" },
          { key: "layer", value: "MAP" },
        ],
        variant,
      ),
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

export function createTerrainMenu(
  themeMode: ThemeMode,
  nameTagsEnabled: boolean,
) {
  OBR.contextMenu.create(buildTerrainMenu(themeMode, nameTagsEnabled, "GM"));
  OBR.contextMenu.create(
    buildTerrainMenu(themeMode, nameTagsEnabled, "PLAYER"),
  );
}

import OBR, { type ContextMenuItem, type KeyFilter } from "@owlbear-rodeo/sdk";
import { getContextMenuUrl } from "../../../helpers/getContextMenuUrl";
import { getPluginId } from "../../../helpers/getPluginId";
import { TOKEN_METADATA_KEY } from "../../../helpers/tokenHelpers";
import {
  NAME_HEIGHT,
  VERTICAL_PADDING,
  ACCESS_TOGGLE_HEIGHT,
  MINION_STATS_HEIGHT,
} from "./constants";
import type { ThemeMode } from "../../../types/themeMode";
import dragonHeadIcon from "../icons/dragonHeadIcon";
import { getGmOnlyRestrictions } from "./getGmOnlyRestrictions";
import type { MinionGroup } from "../../../types/minionGroup";

function buildMinionMenu(
  themeMode: ThemeMode,
  minionGroups: MinionGroup[],
  variant: "GM" | "PLAYER",
): ContextMenuItem {
  const isGm = variant === "GM";

  const some: KeyFilter[] = [
    { key: "layer", value: "CHARACTER", coordinator: "||" },
    { key: "layer", value: "MOUNT" },
    { key: "type", value: "IMAGE" },
    {
      key: ["metadata", TOKEN_METADATA_KEY, "type"],
      operator: "==",
      value: "MINION",
    },
  ];

  if (!isGm) {
    const gmOnlyRestrictions = getGmOnlyRestrictions(minionGroups);
    some.push(...gmOnlyRestrictions);
  }

  return {
    id: getPluginId(isGm ? "gm-menu-minions" : "player-menu-minions"),
    icons: [
      {
        icon: dragonHeadIcon,
        label: "Edit Minions",
        filter: {
          some,
          permissions: isGm ? undefined : ["UPDATE"],
          roles: [variant],
        },
      },
    ],
    embed: {
      url: `${getContextMenuUrl(themeMode)}&minionEditor=true`,
      height:
        NAME_HEIGHT +
        MINION_STATS_HEIGHT +
        VERTICAL_PADDING +
        (isGm ? ACCESS_TOGGLE_HEIGHT : 0),
    },
  };
}

export function createMinionMenu(
  themeMode: ThemeMode,
  minionGroups: MinionGroup[],
) {
  OBR.contextMenu.create(buildMinionMenu(themeMode, minionGroups, "GM"));
  OBR.contextMenu.create(buildMinionMenu(themeMode, minionGroups, "PLAYER"));
}

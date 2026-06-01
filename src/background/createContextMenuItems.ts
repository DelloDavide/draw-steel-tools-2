import OBR, { type ContextMenuIcon } from "@owlbear-rodeo/sdk";
import { getPluginId } from "../helpers/getPluginId";
import knightHelmetIcon from "./icons/knightHelmetIcon";
import dragonHeadIcon from "./icons/dragonHeadIcon";
import type { DefinedSettings } from "../types/settingsZod";
import { getSelectedItems } from "../helpers/getSelectedItem";
import { TOKEN_METADATA_KEY } from "../helpers/tokenHelpers";
import { removeCreatureData } from "../helpers/removeCreatureData";
import type { ThemeMode } from "../types/themeMode";
import type { MinionGroup } from "../types/minionGroup";
import { getGmOnlyRestrictions } from "./getGmOnlyRestrictions";
import { getContextMenuUrl } from "../helpers/getContextMenuUrl";
import {
  VERTICAL_PADDING,
  NAME_HEIGHT,
  HERO_STATS_HEIGHT,
  MONSTER_STATS_HEIGHT,
  MINION_STATS_HEIGHT,
  ACCESS_TOGGLE_HEIGHT,
} from "./contextMenuLayout";
import {
  IMAGE_ON_TOKEN_LAYER,
  HAS_TOKEN_METADATA,
  NO_TOKEN_METADATA,
  NOT_GM_ONLY,
  tokenTypeIs,
  tokenTypeIsNot,
  minionGroupIsNot,
} from "./contextMenuFilters";

export default async function createContextMenuItems(
  settings: DefinedSettings,
  themeMode: ThemeMode,
  minionGroups: MinionGroup[],
) {
  createPlayerMenu(themeMode, settings.nameTagsEnabled, minionGroups);
  createGmMenu(themeMode, settings.nameTagsEnabled, minionGroups);
  createAddStats();
  createRemoveStats(minionGroups);
}

function createPlayerMenu(
  themeMode: ThemeMode,
  nameTagsEnabled: boolean,
  minionGroups: MinionGroup[],
) {
  OBR.contextMenu.create({
    id: getPluginId("player-menu"),
    icons: [
      {
        icon: knightHelmetIcon,
        label: "Edit Hero",
        filter: {
          every: [
            ...IMAGE_ON_TOKEN_LAYER,
            NOT_GM_ONLY,
            tokenTypeIsNot("MONSTER"),
            tokenTypeIsNot("MINION"),
            HAS_TOKEN_METADATA,
          ],
          permissions: ["UPDATE"],
          roles: ["PLAYER"],
          max: 1,
        },
      },
    ],
    embed: {
      url: getContextMenuUrl(themeMode),
      height:
        (nameTagsEnabled ? NAME_HEIGHT : 0) +
        HERO_STATS_HEIGHT +
        VERTICAL_PADDING,
    },
  });

  OBR.contextMenu.create({
    id: getPluginId("player-menu-monster"),
    icons: [
      {
        icon: dragonHeadIcon,
        label: "Edit Monster",
        filter: {
          every: [
            ...IMAGE_ON_TOKEN_LAYER,
            NOT_GM_ONLY,
            tokenTypeIs("MONSTER"),
            HAS_TOKEN_METADATA,
          ],
          permissions: ["UPDATE"],
          roles: ["PLAYER"],
          max: 1,
        },
      },
    ],
    embed: {
      url: getContextMenuUrl(themeMode),
      height:
        (nameTagsEnabled ? NAME_HEIGHT : 0) +
        MONSTER_STATS_HEIGHT +
        VERTICAL_PADDING,
    },
  });

  const gmOnlyRestrictions = getGmOnlyRestrictions(minionGroups);

  OBR.contextMenu.create({
    id: getPluginId("player-menu-minion"),
    icons: minionGroups.map((group) => {
      const mutualExclusionRestrictions = minionGroups
        .filter((item) => item.id !== group.id)
        .map((item) => minionGroupIsNot(item.id));

      return {
        icon: dragonHeadIcon,
        label: "Edit Minions",
        filter: {
          every: [...mutualExclusionRestrictions, ...gmOnlyRestrictions],
          some: [
            ...IMAGE_ON_TOKEN_LAYER,
            HAS_TOKEN_METADATA,
            tokenTypeIs("MINION"),
          ],
          roles: ["PLAYER"],
        },
      } satisfies ContextMenuIcon;
    }),
    embed: {
      url: `${getContextMenuUrl(themeMode)}&minionEditor=true`,
      height: NAME_HEIGHT + MINION_STATS_HEIGHT + VERTICAL_PADDING,
    },
  });
}

function createGmMenu(
  themeMode: ThemeMode,
  nameTagsEnabled: boolean,
  minionGroups: MinionGroup[],
) {
  OBR.contextMenu.create({
    id: getPluginId("gm-menu"),
    icons: [
      {
        icon: knightHelmetIcon,
        label: "Edit Hero",
        filter: {
          every: [
            ...IMAGE_ON_TOKEN_LAYER,
            HAS_TOKEN_METADATA,
            tokenTypeIsNot("MONSTER"),
            tokenTypeIsNot("MINION"),
          ],
          roles: ["GM"],
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
        ACCESS_TOGGLE_HEIGHT,
    },
  });

  OBR.contextMenu.create({
    id: getPluginId("gm-menu-monster"),
    icons: [
      {
        icon: dragonHeadIcon,
        label: "Edit Monster",
        filter: {
          every: [
            ...IMAGE_ON_TOKEN_LAYER,
            HAS_TOKEN_METADATA,
            tokenTypeIs("MONSTER"),
          ],
          roles: ["GM"],
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
        ACCESS_TOGGLE_HEIGHT,
    },
  });

  OBR.contextMenu.create({
    id: getPluginId(`gm-menu-minion`),
    icons: minionGroups.map((group) => {
      const mutualExclusionRestrictions = minionGroups
        .filter((item) => item.id !== group.id)
        .map((item) => minionGroupIsNot(item.id));

      return {
        icon: dragonHeadIcon,
        label: "Edit Minions",
        filter: {
          every: mutualExclusionRestrictions,
          some: [
            ...IMAGE_ON_TOKEN_LAYER,
            HAS_TOKEN_METADATA,
            tokenTypeIs("MINION"),
            {
              key: ["metadata", TOKEN_METADATA_KEY, "groupId"],
              value: group.id,
              operator: "==",
            },
          ],
          roles: ["GM"],
        },
      } satisfies ContextMenuIcon;
    }),
    embed: {
      url: `${getContextMenuUrl(themeMode)}&minionEditor=true`,
      height:
        NAME_HEIGHT +
        MINION_STATS_HEIGHT +
        VERTICAL_PADDING +
        ACCESS_TOGGLE_HEIGHT,
    },
  });
}

function createAddStats() {
  OBR.contextMenu.create({
    id: getPluginId("add-hero"),
    icons: [
      {
        icon: knightHelmetIcon,
        label: "Add Hero",
        filter: {
          every: [
            ...IMAGE_ON_TOKEN_LAYER,
            NO_TOKEN_METADATA,
          ],
          // roles: ["GM"],
        },
      },
    ],
    onClick: async () => {
      const selectedItems = await getSelectedItems();
      OBR.scene.items.updateItems(
        selectedItems.map((item) => item.id),
        (items) => {
          items.forEach((item) => {
            item.metadata[TOKEN_METADATA_KEY] = { type: "HERO" };
          });
        },
      );
    },
  });

  OBR.contextMenu.create({
    id: getPluginId("add-monster"),
    icons: [
      {
        icon: dragonHeadIcon,
        label: "Add Monster",
        filter: {
          max: 1,
          every: [
            ...IMAGE_ON_TOKEN_LAYER,
            NO_TOKEN_METADATA,
          ],
        },
      },
    ],
    onClick: async () => {
      const selectedItems = await getSelectedItems();
      const playerRole = await OBR.player.getRole();
      OBR.scene.items.updateItems(
        selectedItems.map((item) => item.id),
        (items) => {
          items.forEach((item) => {
            item.metadata[TOKEN_METADATA_KEY] = {
              type: "MONSTER",
              gmOnly: playerRole === "GM" ? true : false,
            };
          });
        },
      );
    },
  });

  OBR.contextMenu.create({
    id: getPluginId("add-monsters"),
    icons: [
      {
        icon: dragonHeadIcon,
        label: "Add Monsters",
        filter: {
          min: 2,
          every: [
            ...IMAGE_ON_TOKEN_LAYER,
            NO_TOKEN_METADATA,
          ],
        },
      },
    ],
    onClick: async () => {
      const themeMode = (await OBR.theme.getTheme()).mode;
      OBR.popover.open({
        id: getPluginId("statblockSearch"),
        url: `/statblockSearch?themeMode=${themeMode}`,
        height: 1000,
        width: 800,
        anchorOrigin: { horizontal: "CENTER", vertical: "CENTER" },
        transformOrigin: {
          horizontal: "CENTER",
          vertical: "CENTER",
        },
      });
    },
  });
}

function createRemoveStats(minionGroups: MinionGroup[]) {
  const gmOnlyRestrictions = getGmOnlyRestrictions(minionGroups);

  OBR.contextMenu.create({
    id: getPluginId("remove-stats"),
    icons: [
      {
        icon: dragonHeadIcon,
        label: "Remove Character",
        filter: {
          some: [...IMAGE_ON_TOKEN_LAYER, HAS_TOKEN_METADATA],
          max: 1,
          roles: ["GM"],
        },
      },
      {
        icon: dragonHeadIcon,
        label: "Remove Characters",
        filter: {
          some: [...IMAGE_ON_TOKEN_LAYER, HAS_TOKEN_METADATA],
          min: 2,
          roles: ["GM"],
        },
      },
      {
        icon: dragonHeadIcon,
        label: "Remove Character",
        filter: {
          some: [...IMAGE_ON_TOKEN_LAYER, HAS_TOKEN_METADATA],
          every: [NOT_GM_ONLY, ...gmOnlyRestrictions],
          roles: ["PLAYER"],
        },
      },
    ],
    onClick: async () => {
      const selectedItems = await getSelectedItems();
      removeCreatureData(selectedItems);
    },
  });
}

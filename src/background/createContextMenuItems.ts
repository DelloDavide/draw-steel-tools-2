import OBR, { type ContextMenuIcon, type KeyFilter } from "@owlbear-rodeo/sdk";
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

const VERTICAL_PADDING = 16;
const NAME_HEIGHT = 36 + 18 + 8;
const HERO_STATS_HEIGHT = 178;
const MONSTER_STATS_HEIGHT = 54 + 62;
const MINION_STATS_HEIGHT = 178;
const ACCESS_TOGGLE_HEIGHT = 20 + 16 + 8;

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
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY, "gmOnly"],
              value: true,
              operator: "!=",
            },
            {
              key: ["metadata", TOKEN_METADATA_KEY, "type"],
              value: "MONSTER",
              operator: "!=",
            },
            {
              key: ["metadata", TOKEN_METADATA_KEY, "type"],
              value: "MINION",
              operator: "!=",
            },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "!=",
            },
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
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY, "gmOnly"],
              value: true,
              operator: "!=",
            },
            {
              key: ["metadata", TOKEN_METADATA_KEY, "type"],
              value: "MONSTER",
              operator: "==",
            },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "!=",
            },
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
        .map(
          (item) =>
            ({
              key: ["metadata", TOKEN_METADATA_KEY, "groupId"],
              value: item.id,
              operator: "!=",
            }) satisfies KeyFilter,
        );

      return {
        icon: dragonHeadIcon,
        label: "Edit Minions",
        filter: {
          every: [...mutualExclusionRestrictions, ...gmOnlyRestrictions],
          some: [
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "!=",
            },
            {
              key: ["metadata", TOKEN_METADATA_KEY, "type"],
              value: "MINION",
              operator: "==",
            },
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
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "!=",
            },
            {
              key: ["metadata", TOKEN_METADATA_KEY, "type"],
              value: "MONSTER",
              operator: "!=",
            },
            {
              key: ["metadata", TOKEN_METADATA_KEY, "type"],
              value: "MINION",
              operator: "!=",
            },
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
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "!=",
            },
            {
              key: ["metadata", TOKEN_METADATA_KEY, "type"],
              value: "MONSTER",
              operator: "==",
            },
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
        .map(
          (item) =>
            ({
              key: ["metadata", TOKEN_METADATA_KEY, "groupId"],
              value: item.id,
              operator: "!=",
            }) satisfies KeyFilter,
        );

      return {
        icon: dragonHeadIcon,
        label: "Edit Minions",
        filter: {
          every: mutualExclusionRestrictions,
          some: [
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "!=",
            },
            {
              key: ["metadata", TOKEN_METADATA_KEY, "type"],
              value: "MINION",
              operator: "==",
            },
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
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "==",
            },
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
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "==",
            },
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
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "==",
            },
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
          some: [
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "!=",
            },
          ],
          max: 1,
          roles: ["GM"],
        },
      },
      {
        icon: dragonHeadIcon,
        label: "Remove Characters",
        filter: {
          some: [
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "!=",
            },
          ],
          min: 2,
          roles: ["GM"],
        },
      },
      {
        icon: dragonHeadIcon,
        label: "Remove Character",
        filter: {
          some: [
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: "type", value: "IMAGE" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "!=",
            },
          ],
          every: [
            {
              key: ["metadata", TOKEN_METADATA_KEY, "gmOnly"],
              value: true,
              operator: "!=",
            },
            ...gmOnlyRestrictions,
          ],
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

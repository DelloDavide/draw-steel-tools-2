import OBR, { type Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "../../../helpers/getPluginId";
import { getSelectedItems } from "../../../helpers/getSelectedItem";
import { TOKEN_METADATA_KEY } from "../../../helpers/tokenHelpers";
import dragonHeadIcon from "../icons/dragonHeadIcon";
import knightHelmetIcon from "../icons/knightHelmetIcon";
import landPlotIcon from "../icons/landPlotIcon";
import {
  CharacterTokenDataZod,
  type CharacterTokenData,
} from "../../../types/tokenDataZod";
import { openStatblockSearch } from "../../../helpers/openStatblockSearch";

async function setSelectionMetadata(
  metadata: CharacterTokenData,
  selection?: {
    selection?: string[];
    items?: Item[];
  },
) {
  CharacterTokenDataZod.parse(metadata);

  const selectedItems = await getSelectedItems(selection);
  OBR.scene.items.updateItems(
    selectedItems.map((item) => item.id),
    (items) => {
      items.forEach((item) => {
        item.metadata[TOKEN_METADATA_KEY] = metadata;
      });
    },
  );
}

export function createAddStats() {
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
          permissions: ["UPDATE"],
          max: 1,
        },
      },
    ],
    onClick: () => setSelectionMetadata({ type: "HERO" }),
  });

  OBR.contextMenu.create({
    id: getPluginId("add-monster"),
    icons: [
      {
        icon: dragonHeadIcon,
        label: "Add Monster",
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
          permissions: ["UPDATE"],
          max: 1,
        },
      },
    ],
    onClick: async () => {
      const playerRole = await OBR.player.getRole();
      setSelectionMetadata({
        type: "MONSTER",
        gmOnly: playerRole === "GM" ? true : false,
      });
    },
  });

  OBR.contextMenu.create({
    id: getPluginId("add-terrain"),
    icons: [
      {
        icon: landPlotIcon,
        label: "Add Terrain",
        filter: {
          every: [
            { key: "type", value: "SHAPE", coordinator: "||" },
            { key: "type", value: "CURVE" },
            { key: "layer", value: "DRAWING" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "==",
            },
          ],
          permissions: ["MAP_UPDATE"],
          max: 1,
        },
      },
      {
        icon: landPlotIcon,
        label: "Add Terrain",
        filter: {
          every: [
            { key: "type", value: "IMAGE", coordinator: "||" },
            { key: "type", value: "SHAPE", coordinator: "||" },
            { key: "type", value: "CURVE" },
            { key: "layer", value: "MAP" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "==",
            },
          ],
          permissions: ["MAP_UPDATE"],
          max: 1,
        },
      },
    ],
    onClick: async () => {
      const playerRole = await OBR.player.getRole();
      setSelectionMetadata({
        type: "TERRAIN",
        gmOnly: playerRole === "GM" ? true : false,
      });
    },
  });

  OBR.contextMenu.create({
    id: getPluginId("add-creature"),
    icons: [
      {
        icon: dragonHeadIcon,
        label: "Add Creatures",
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
          permissions: ["UPDATE"],
          min: 2,
        },
      },
    ],
    onClick: () => openStatblockSearch({ organization: "CREATURE" }),
  });

  OBR.contextMenu.create({
    id: getPluginId("add-terrains"),
    icons: [
      {
        icon: landPlotIcon,
        label: "Add Terrain",
        filter: {
          every: [
            { key: "type", value: "SHAPE", coordinator: "||" },
            { key: "type", value: "CURVE" },
            { key: "layer", value: "DRAWING" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "==",
            },
          ],
          permissions: ["MAP_UPDATE"],
          min: 2,
        },
      },
      {
        icon: landPlotIcon,
        label: "Add Terrain",
        filter: {
          every: [
            { key: "type", value: "IMAGE", coordinator: "||" },
            { key: "type", value: "SHAPE", coordinator: "||" },
            { key: "type", value: "CURVE" },
            { key: "layer", value: "MAP" },
            {
              key: ["metadata", TOKEN_METADATA_KEY],
              value: undefined,
              operator: "==",
            },
          ],
          permissions: ["MAP_UPDATE"],
          min: 2,
        },
      },
    ],
    onClick: () => openStatblockSearch({ organization: "TERRAIN" }),
  });
}

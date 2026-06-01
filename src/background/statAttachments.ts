import OBR, { type Image, type Item, isImage } from "@owlbear-rodeo/sdk";
import { hpTextId } from "./overlays/compoundItemHelpers";
import createContextMenuItems from "./createContextMenuItems";
import {
  defaultSettings,
  getSettings,
  SETTINGS_METADATA_KEY,
  LEGACY_SETTINGS_METADATA_KEY,
} from "../helpers/settingsHelpers";
import { TOKEN_METADATA_KEY, parseTokenData } from "../helpers/tokenHelpers";
import type { MinionTokenData } from "../types/tokenDataZod";
import { MinionGroupZod, type MinionGroup } from "../types/minionGroup";
import z from "zod";
import { MONSTER_GROUPS_METADATA_KEY } from "../helpers/monsterGroupHelpers";
import { setDifference } from "../helpers/setDifference";
import { sendItemsToScene } from "./sendItemsToScene";
import { createHeroOverlay } from "./overlays/createHeroOverlay";
import { createMonsterOverlay } from "./overlays/createMonsterOverlay";
import { createMinionOverlay } from "./overlays/createMinionOverlay";
import {
  getMinionTokenCounts,
  type TokenCounts,
} from "../helpers/getMinionTokenCounts";
import type { DefinedSettings } from "../types/settingsZod";

type AttachmentLog = { image: Image; attachmentIds: string[] } | undefined;
type AttachmentLogs = Record<string, AttachmentLog>;
const addItemsArray: Item[] = []; // for bulk addition or changing of items
const deleteItemsArray: string[] = []; // for bulk deletion of scene items

const ObrState: {
  images: Image[];
  playerRole: "PLAYER" | "GM";
  minionGroups: MinionGroup[];
  minionTokenCounts: TokenCounts;
  settings: DefinedSettings;
  attachmentLogs: AttachmentLogs;
  sceneDpi: number;
  themeMode: "DARK" | "LIGHT";
} = {
  images: [],
  playerRole: "PLAYER",
  minionGroups: [],
  minionTokenCounts: {},
  settings: defaultSettings,
  attachmentLogs: {},
  sceneDpi: 150,
  themeMode: "DARK",
};

export default async function startBackground() {
  let started = false;
  const start = async (sceneIsReady: boolean) => {
    // Only run this the first time a scene is ready
    if (!sceneIsReady) return;
    if (started) return;
    started = true;

    const [
      sceneMetadata,
      roomMetadata,
      themeMode,
      playerRole,
      items,
      sceneDpi,
    ] = await Promise.all([
      OBR.scene.getMetadata(),
      OBR.room.getMetadata(),
      OBR.theme.getTheme(),
      OBR.player.getRole(),
      OBR.scene.items.getItems(),
      OBR.scene.grid.getDpi(),
    ]);

    const minionGroupParse = z
      .array(MinionGroupZod)
      .safeParse(sceneMetadata[MONSTER_GROUPS_METADATA_KEY]);
    const minionGroups = minionGroupParse.success ? minionGroupParse.data : [];
    const minionTokenCounts = getMinionTokenCounts(items, minionGroups).counts;

    ObrState.images = items.filter((item) => isImage(item));
    ObrState.playerRole = playerRole;
    ObrState.minionGroups = minionGroups;
    ObrState.minionTokenCounts = minionTokenCounts;
    ObrState.settings = getSettings(roomMetadata).settings;
    ObrState.attachmentLogs = {};
    ObrState.sceneDpi = sceneDpi;
    ObrState.themeMode = themeMode.mode;

    // Migrate settings from legacy shared key to dedicated key
    if (
      roomMetadata[SETTINGS_METADATA_KEY] === undefined &&
      roomMetadata[LEGACY_SETTINGS_METADATA_KEY] !== undefined
    ) {
      OBR.room.setMetadata({
        [SETTINGS_METADATA_KEY]: roomMetadata[LEGACY_SETTINGS_METADATA_KEY],
      });
    }

    OBR.player.onChange((player) => {
      if (player.role === ObrState.playerRole) return;
      ObrState.playerRole = player.role;
      refreshAllAttachments();
    });

    OBR.theme.onChange((theme) => {
      ObrState.themeMode = theme.mode;
      createContextMenuItems(
        ObrState.settings,
        ObrState.themeMode,
        ObrState.minionGroups,
      );
    });

    OBR.room.onMetadataChange(async (metadata) => {
      const settings = getSettings(metadata, ObrState.settings);
      ObrState.settings = settings.settings;
      if (!settings.isChanged) return;
      createContextMenuItems(
        ObrState.settings,
        ObrState.themeMode,
        ObrState.minionGroups,
      );
      refreshAllAttachments();
    });

    OBR.scene.onMetadataChange((metadata) => {
      const minionGroupParse = z
        .array(MinionGroupZod)
        .optional()
        .safeParse(metadata[MONSTER_GROUPS_METADATA_KEY]);
      if (!minionGroupParse.success)
        return console.error("Invalid minion group data");

      // Check for changes
      const oldMinionGroupsString = JSON.stringify(ObrState.minionGroups);
      const newMinionGroupsString = JSON.stringify(minionGroupParse.data);
      if (oldMinionGroupsString === newMinionGroupsString) return;

      // Update state
      ObrState.minionGroups =
        minionGroupParse.success && minionGroupParse.data
          ? minionGroupParse.data
          : [];
      ObrState.minionTokenCounts = getMinionTokenCounts(
        ObrState.images,
        ObrState.minionGroups,
        ObrState.minionTokenCounts,
      ).counts;
      createContextMenuItems(
        ObrState.settings,
        ObrState.themeMode,
        ObrState.minionGroups,
      );

      refreshAllAttachments();
    });

    OBR.scene.items.onChange(async (items) => {
      // Update ObrState
      const images = items.filter((item) => isImage(item));
      ObrState.images = images;
      const minionTokens = getMinionTokenCounts(
        images,
        ObrState.minionGroups,
        ObrState.minionTokenCounts,
      );
      ObrState.minionTokenCounts = minionTokens.counts;

      //create list of modified and new items, skipping deleted items
      const separatedImages = separateChangedItems(
        images,
        minionTokens.changed,
      );

      // Add and delete attachments
      const newAttachmentLog: AttachmentLogs = {};
      for (const image of separatedImages.changed) {
        const attachmentIds = updateTokenOverlay(
          image,
          ObrState.playerRole,
          ObrState.sceneDpi,
        );
        newAttachmentLog[image.id] = { image, attachmentIds };
      }
      for (const image of separatedImages.unchanged) {
        newAttachmentLog[image.id] = ObrState.attachmentLogs[image.id];
      }
      ObrState.attachmentLogs = newAttachmentLog;

      sendItemsToScene(addItemsArray, deleteItemsArray);
    });

    OBR.scene.onReadyChange((isReady) => {
      if (!isReady) ObrState.attachmentLogs = {};
    });

    createContextMenuItems(
      ObrState.settings,
      ObrState.themeMode,
      ObrState.minionGroups,
    );
    refreshAllAttachments();
  };

  OBR.scene.isReady().then(start);
  OBR.scene.onReadyChange(start);
}

async function refreshAllAttachments() {
  const newAttachmentLog: AttachmentLogs = {};
  for (const image of ObrState.images) {
    const attachmentIds = updateTokenOverlay(
      image,
      ObrState.playerRole,
      ObrState.sceneDpi,
    );
    newAttachmentLog[image.id] = { image, attachmentIds };
  }
  ObrState.attachmentLogs = newAttachmentLog;

  sendItemsToScene(addItemsArray, deleteItemsArray);
}

function separateChangedItems(images: Image[], includeAllMinions: boolean) {
  const changed: Image[] = [];
  const unchanged: Image[] = [];

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const lastUpdate = ObrState.attachmentLogs[image.id]?.image;

    if (lastUpdate === undefined) {
      changed.push(image);
    } else if (
      //check for scaling changes
      !(
        lastUpdate.scale.x === image.scale.x &&
        lastUpdate.scale.y === image.scale.y &&
        (lastUpdate.name === image.name || !ObrState.settings.nameTagsEnabled)
      )
    ) {
      // Attachments must be deleted to prevent ghost selection highlight bug
      deleteItemsArray.push(hpTextId(image.id));
      changed.push(image);
    } else if (
      //check position, visibility, and metadata changes
      !(
        lastUpdate.layer === image.layer &&
        lastUpdate.position.x === image.position.x &&
        lastUpdate.position.y === image.position.y &&
        lastUpdate.grid.offset.x === image.grid.offset.x &&
        lastUpdate.grid.offset.y === image.grid.offset.y &&
        lastUpdate.grid.dpi === image.grid.dpi &&
        lastUpdate.visible === image.visible &&
        JSON.stringify(lastUpdate.metadata[TOKEN_METADATA_KEY]) ===
          JSON.stringify(image.metadata[TOKEN_METADATA_KEY])
      ) ||
      (includeAllMinions &&
        (image.metadata[TOKEN_METADATA_KEY] as MinionTokenData)?.type ===
          "MINION")
    ) {
      //update items
      changed.push(image);
    } else {
      unchanged.push(image);
    }
  }
  return { changed, unchanged };
}

function updateTokenOverlay(image: Image, role: "PLAYER" | "GM", dpi: number) {
  const token = parseTokenData(image.metadata);

  let attachments: Item[];
  if (!["MOUNT", "CHARACTER"].includes(image.layer)) {
    attachments = [];
  } else if (token.type === "MONSTER") {
    attachments = createMonsterOverlay(
      image,
      token,
      role,
      dpi,
      ObrState.settings,
    );
  } else if (token.type === "MINION") {
    attachments = createMinionOverlay(
      image,
      token,
      ObrState.minionGroups,
      role,
      dpi,
      ObrState.settings,
      ObrState.minionTokenCounts,
    );
  } else {
    attachments = createHeroOverlay(image, token, role, dpi, ObrState.settings);
  }
  addItemsArray.push(...attachments);

  const attachmentIds = attachments.map((value) => value.id);
  const lastUpdate = ObrState.attachmentLogs[image.id];
  if (lastUpdate) {
    const unusedIds = setDifference(lastUpdate.attachmentIds, attachmentIds);
    deleteItemsArray.push(...unusedIds);
  }

  return attachmentIds;
}

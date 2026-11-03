import OBR from "@owlbear-rodeo/sdk";
import createContextMenuItems from "./contextMenuItems/createContextMenuItems";
import { defaultSettings, getSettings } from "../helpers/settingsHelpers";
import { MinionGroupZod } from "../types/minionGroup";
import z from "zod";
import { MONSTER_GROUPS_METADATA_KEY } from "../helpers/monsterGroupHelpers";
import { sendItemsToLocal } from "./itemChangeHandling/sendItemsToLocal";
import { getMinionTokenCounts } from "../helpers/getMinionTokenCounts";
import { getUpdateBundles } from "./itemChangeHandling/getUpdateBundles";
import type { ObrState, ChangedData } from "./types";
import { processUpdateBundles } from "./itemChangeHandling/processUpdateBundles";
import { printVersionToConsole } from "./printVersionToConsole";

/**
 * This file represents the background script run when the plugin loads.
 */

OBR.onReady(async () => {
  printVersionToConsole();

  const obrState: ObrState = {
    items: [],
    playerRole: "PLAYER",
    minionGroups: [],
    minionTokenCounts: {},
    settings: defaultSettings,
    attachmentLogs: {},
    sceneDpi: 150,
    themeMode: "DARK",
  };

  function refreshAttachments(changed: ChangedData) {
    const updateBundles = getUpdateBundles(obrState, changed);
    const updates = processUpdateBundles(updateBundles, obrState);
    obrState.attachmentLogs = updates.newAttachmentLogs;
    sendItemsToLocal(updates.addItemsArray, updates.deleteItemsArray);
  }

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

    obrState.items = items;
    obrState.playerRole = playerRole;
    obrState.minionGroups = minionGroups;
    obrState.minionTokenCounts = minionTokenCounts;
    obrState.settings = getSettings(roomMetadata).settings;
    obrState.attachmentLogs = {};
    obrState.sceneDpi = sceneDpi;
    obrState.themeMode = themeMode.mode;

    OBR.player.onChange((player) => {
      if (player.role === obrState.playerRole) return;
      obrState.playerRole = player.role;
      refreshAttachments({ role: true });
    });

    OBR.theme.onChange((theme) => {
      obrState.themeMode = theme.mode;
      createContextMenuItems(
        obrState.settings,
        obrState.themeMode,
        obrState.minionGroups,
      );
    });

    OBR.room.onMetadataChange((metadata) => {
      const settings = getSettings(metadata, obrState.settings);
      obrState.settings = settings.settings;
      if (!settings.isChanged) return;
      createContextMenuItems(
        obrState.settings,
        obrState.themeMode,
        obrState.minionGroups,
      );
      refreshAttachments({ settings: true });
    });

    OBR.scene.onMetadataChange((metadata) => {
      const minionGroupParse = z
        .array(MinionGroupZod)
        .optional()
        .safeParse(metadata[MONSTER_GROUPS_METADATA_KEY]);
      if (!minionGroupParse.success)
        return console.error("Invalid minion group data");

      // Check for changes
      const oldMinionGroupsString = JSON.stringify(obrState.minionGroups);
      const newMinionGroupsString = JSON.stringify(minionGroupParse.data);
      if (oldMinionGroupsString === newMinionGroupsString) return;

      // Update state
      obrState.minionGroups =
        minionGroupParse.success && minionGroupParse.data
          ? minionGroupParse.data
          : [];

      const minionTokenCounts = getMinionTokenCounts(
        obrState.items,
        obrState.minionGroups,
        obrState.minionTokenCounts,
      );
      obrState.minionTokenCounts = minionTokenCounts.counts;

      createContextMenuItems(
        obrState.settings,
        obrState.themeMode,
        obrState.minionGroups,
      );
      refreshAttachments({ minions: true });
    });

    OBR.scene.items.onChange((items) => {
      // Update ObrState
      obrState.items = items;
      const minionTokens = getMinionTokenCounts(
        items,
        obrState.minionGroups,
        obrState.minionTokenCounts,
      );
      obrState.minionTokenCounts = minionTokens.counts;

      refreshAttachments({ items, minions: minionTokens.changed });
    });

    OBR.scene.onReadyChange((isReady) => {
      if (!isReady) obrState.attachmentLogs = {};
    });

    createContextMenuItems(
      obrState.settings,
      obrState.themeMode,
      obrState.minionGroups,
    );
    refreshAttachments({ items, minions: true, role: true, settings: true });
  };

  OBR.scene.isReady().then(start);
  OBR.scene.onReadyChange(start);
});

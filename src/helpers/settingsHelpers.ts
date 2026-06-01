import { type Metadata } from "@owlbear-rodeo/sdk";
import { SettingsZod, type DefinedSettings } from "../types/settingsZod";
import { parseMetadata } from "./parseMetadata";
import { getPluginId } from "./getPluginId";

export const SETTINGS_METADATA_KEY = getPluginId("settings");
/** @deprecated Used only for backward-compatible migration from the old shared key. */
export const LEGACY_SETTINGS_METADATA_KEY = getPluginId("metadata");

export const defaultSettings: DefinedSettings = {
  nameTagsEnabled: false,
  verticalOffset: 0,
  justifyHealthBarsTop: false,
  showHealthBars: false,
  segmentsCount: 0,
  keepPowerRollBonus: false,
  keepActivitiesOpen: false,
};

export function getSettings(
  metadata: Metadata,
  currentSettings?: DefinedSettings,
) {
  const parsed =
    parseMetadata(metadata, SETTINGS_METADATA_KEY, SettingsZod.parse) ??
    parseMetadata(metadata, LEGACY_SETTINGS_METADATA_KEY, SettingsZod.parse);
  const settings = {
    ...defaultSettings,
    ...parsed,
  };

  if (currentSettings === undefined) return { settings, isChanged: true };

  let isChanged = false;
  for (const key of Object.keys(defaultSettings)) {
    if (
      (currentSettings[key as keyof DefinedSettings] as unknown) !==
      settings[key as keyof DefinedSettings]
    ) {
      isChanged = true;
      break;
    }
  }

  return { settings, isChanged };
}

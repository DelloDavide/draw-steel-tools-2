import type { DefinedSettings } from "../../types/settingsZod";
import type { ThemeMode } from "../../types/themeMode";
import type { MinionGroup } from "../../types/minionGroup";
import { createRemoveStats } from "./menus/createRemoveStats";
import { createAddStats } from "./menus/createAddStats";
import { createHeroMenu } from "./menus/createHeroMenus";
import { createMonsterMenu } from "./menus/createMonsterMenus";
import { createMinionMenu } from "./menus/createMinionMenus";
import { createTerrainMenu } from "./menus/createTerrainMenus";

export default async function createContextMenuItems(
  settings: DefinedSettings,
  themeMode: ThemeMode,
  minionGroups: MinionGroup[],
) {
  const nameTagsEnabled = settings.nameTagsEnabled;

  createHeroMenu(themeMode, nameTagsEnabled);
  createMonsterMenu(themeMode, nameTagsEnabled);
  createMinionMenu(themeMode, minionGroups);
  createTerrainMenu(themeMode, nameTagsEnabled);
  createAddStats();
  createRemoveStats(minionGroups);
}

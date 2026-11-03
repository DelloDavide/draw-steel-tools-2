import { useState } from "react";
import type { IndexBundle } from "../types/monsterDataBundlesZod";
import usePlayerRole from "../helpers/usePlayerRole";
import { useItems } from "../helpers/useItems";
import usePlayerSelection from "../helpers/usePlayerSelection";
import { getTargetItems } from "./helpers/getItemsWithGroupId";
import { StatblockPreviewDialog } from "./components/StatblockPreviewDialog";
import { defaultSettings, SETTINGS_METADATA_KEY } from "../helpers/settingsHelpers";
import { useRoomMetadata } from "../helpers/useRoomMetadata";
import { SettingsZod } from "../types/settingsZod";
import { OptionsView } from "./optionsView/OptionsView";
import { getDefaulAppState } from "./helpers/AppState";
import SearchView from "./searchView/SearchView";

const groupId = new URLSearchParams(document.location.search).get("groupId");

export default function StatblockSearch({
  monsterIndex,
}: {
  monsterIndex: IndexBundle[];
}) {
  const [appState, setAppState] = useState(getDefaulAppState());
  const playerRole = usePlayerRole();
  const items = useItems();
  const selection = usePlayerSelection();
  const settingsMetadata = useRoomMetadata(
    SETTINGS_METADATA_KEY,
    SettingsZod.parse,
  );

  const targetItems = getTargetItems(items, selection, groupId);
  const settings = { ...defaultSettings, ...settingsMetadata.value };

  return (
    <div>
      <StatblockPreviewDialog appState={appState} setAppState={setAppState} />
      <div className="text-foreground bg-mirage-50 dark:bg-mirage-950 border-mirage-300 dark:border-mirage-700 flex h-screen min-h-screen flex-col rounded-2xl border">
        {appState.selectedIndexBundle === undefined ? (
          <SearchView
            monsterIndex={monsterIndex}
            appState={appState}
            setAppState={setAppState}
            playerRole={playerRole}
          />
        ) : (
          <OptionsView
            appState={appState}
            setAppState={setAppState}
            playerRole={playerRole}
            targetItems={targetItems}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./../index.css";

import { StatblockViewer } from "./StatblockViewer.tsx";
import { PluginReadyProvider } from "../components/logic/PluginReadyProvider.tsx";
import { RollAttributesProvider } from "./context/RollAttributesProvider.tsx";
import { DiceDrawerProvider } from "./context/DiceDrawerContextProvider.tsx";
import { RoomMetadataProvider } from "./context/RoomMetadataProvider.tsx";
import { MaliceSpentContextProvider } from "./context/MaliceSpentContextProvider.tsx";
import { RoomTrackersZod } from "../types/roomTrackersZod.ts";
import { getPluginId } from "../helpers/getPluginId.ts";
import { SETTINGS_METADATA_KEY } from "../helpers/settingsHelpers.ts";
import {
  RoomTrackersContext,
  UpdateRoomTrackersContext,
} from "./context/RoomTrackersContext.ts";
import { SettingsZod } from "../types/settingsZod.ts";
import {
  RoomSettingsContext,
  UpdateRoomSettingsContext,
} from "./context/RoomSettingsContext.ts";
import { ErrorBoundary } from "../components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PluginReadyProvider>
      <DiceDrawerProvider>
        <RollAttributesProvider>
          <RoomMetadataProvider
            parser={RoomTrackersZod.parse}
            metadataKey={getPluginId("trackers")}
            defaultValue={undefined}
            DataContext={RoomTrackersContext}
            UpdateContext={UpdateRoomTrackersContext}
          >
            <RoomMetadataProvider
              parser={SettingsZod.parse}
              metadataKey={SETTINGS_METADATA_KEY}
              defaultValue={undefined}
              DataContext={RoomSettingsContext}
              UpdateContext={UpdateRoomSettingsContext}
            >
              <MaliceSpentContextProvider>
                <StatblockViewer />
              </MaliceSpentContextProvider>
            </RoomMetadataProvider>
          </RoomMetadataProvider>
        </RollAttributesProvider>
      </DiceDrawerProvider>
    </PluginReadyProvider>
    </ErrorBoundary>
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./../index.css";
import { syncThemeMode } from "../helpers/syncThemeMode.ts";
import StatblockSearch from "./StatblockSearch.tsx";
import { PluginReadyProvider } from "../components/logic/PluginReadyProvider.tsx";
import { PluginReadyGate } from "../components/logic/PluginReadyGate.tsx";
import { DevActionButtons } from "./components/DevScriptButtons.tsx";

import monsterIndex from "./monsterIndex.json";
import heroIndex from "./heroIndex.json";

syncThemeMode();

const params = new URLSearchParams(document.location.search);
const devMode = params.get("dev");
const type = params.get("type");
const isHeroSearch = type === "hero";

const index = isHeroSearch ? heroIndex : monsterIndex;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PluginReadyProvider>
      <PluginReadyGate
        alternate={
          devMode === "true" && !isHeroSearch && (
            <DevActionButtons monsterIndex={monsterIndex} />
          )
        }
      >
        <StatblockSearch monsterIndex={index} />
      </PluginReadyGate>
    </PluginReadyProvider>
  </StrictMode>,
);

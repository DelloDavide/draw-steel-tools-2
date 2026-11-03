import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./../index.css";
import { syncThemeMode } from "../helpers/syncThemeMode.ts";
import StatblockSearch from "./StatblockSearch.tsx";
import { PluginReadyProvider } from "../components/logic/PluginReadyProvider.tsx";
import { PluginReadyGate } from "../components/logic/PluginReadyGate.tsx";
import { DevActionButtons } from "./devScriptButtons/DevScriptButtons.tsx";
import { ErrorBoundary } from "../components/ErrorBoundary.tsx";
import { monsterIndex } from "./devScriptButtons/monsterIndex.ts";
import dynamicTerrainIndex from "./dynamicTerrainIndex.json";
import heroIndex from "./heroIndex.json";
import type { IndexBundle } from "../types/monsterDataBundlesZod.ts";

syncThemeMode();

const params = new URLSearchParams(document.location.search);
const devMode = params.get("dev");
const isHeroSearch = params.get("type") === "hero";

const dynamicTerrainBundles: IndexBundle[] = dynamicTerrainIndex.map(
  (terrain) => ({
    id: terrain.statblock,
    path: terrain.statblock,
    name: terrain.name,
    type: "terrain",
    level: terrain.level,
    ev: terrain.ev,
    roles: terrain.roles,
  }),
);

const index = [
  ...new Map(
    [...monsterIndex, ...dynamicTerrainBundles].map((bundle) => [
      bundle.id,
      bundle,
    ]),
  ).values(),
];
const searchIndex: IndexBundle[] = isHeroSearch
  ? heroIndex.map((hero) => ({
      id: hero.name,
      path: hero.statblock,
      name: hero.name,
      type: "statblock",
      level: hero.level,
      ev: hero.ev,
      roles: ["Hero"],
      ancestry: hero.ancestry,
      features: [],
    }))
  : index;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PluginReadyProvider>
        <PluginReadyGate
          alternate={
            devMode === "true" && (
              <DevActionButtons monsterIndex={searchIndex} />
            )
          }
        >
          <StatblockSearch monsterIndex={searchIndex} />
        </PluginReadyGate>
      </PluginReadyProvider>
    </ErrorBoundary>
  </StrictMode>,
);

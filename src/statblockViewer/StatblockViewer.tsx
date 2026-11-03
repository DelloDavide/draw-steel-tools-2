import "./../index.css";
import MonsterView from "./creatureBlockUI/MonsterView.tsx";
import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../helpers/getPluginId.ts";
import { Maximize2Icon, Minimize2Icon } from "lucide-react";
import { StatBlockSwitcher } from "./StatblockSwitcher.tsx";
import { useEffect, useMemo, useState } from "react";
import { dataFromBestiaryIndexId } from "../helpers/monsterDataFromStatblockName.ts";
import { cn } from "../helpers/utils.ts";
import Toggle from "../components/ui/Toggle.tsx";
import { OpenInNewTab } from "./OpenInNewTabButton.tsx";
import HeightMatch from "../components/logic/HeightMatch.tsx";
import { PluginReadyGate } from "../components/logic/PluginReadyGate.tsx";
import { DiceDrawer } from "./DiceDrawer.tsx";
import { ClassResourceBar } from "./ClassResourceBar.tsx";
import { HeroTokenProvider } from "./context/HeroTokenProvider.tsx";
import { HeroClassResourceNamesContext } from "./context/HeroClassResourceNamesContext.ts";
import { extractClassResourceNamesFromHeroBundle } from "../helpers/classResourceHelpers.ts";
import {
  getCreatureName,
  type CreatureDataBundle,
} from "../types/creatureDataBundle.ts";
import type { DrawSteelResourceBundle } from "../types/monsterDataBundlesZod.ts";

type ViewerData = CreatureDataBundle | DrawSteelResourceBundle;

const params = new URLSearchParams(document.location.search);
const initialStatblockName = params.get("statblockName");
const initialResourceId = params.get("resourceId");
const itemIdParam = params.get("itemId");

function getViewerDataName(data: ViewerData | null | undefined) {
  if (!data) return undefined;
  return "kind" in data ? getCreatureName(data) : data.resource.name;
}

function isHeroData(data: ViewerData | null | undefined): data is Extract<
  CreatureDataBundle,
  { kind: "hero" }
> {
  return data !== null && data !== undefined && "kind" in data && data.kind === "hero";
}

export function StatblockViewer() {
  const [collapsed, setCollapsed] = useState(false);
  const [monsterData, setMonsterData] = useState<ViewerData | null>();
  const [height, setHeight] = useState(57);

  useEffect(() => {
    const id = initialResourceId || initialStatblockName;
    if (!id) {
      setMonsterData(null);
      return;
    }

    dataFromBestiaryIndexId(id)
      .then((data) => {
        document.title = getViewerDataName(data) ?? "Statblock";
        setMonsterData(data);
      })
      .catch((error: unknown) => {
        console.error(error);
        setMonsterData(null);
      });
  }, []);

  const activeStatblockName = getViewerDataName(monsterData) ?? null;
  const heroClassResourceNames = useMemo(
    () =>
      isHeroData(monsterData)
        ? extractClassResourceNamesFromHeroBundle(monsterData)
        : [],
    [monsterData],
  );
  const resourceId =
    monsterData && "key" in monsterData && "resource" in monsterData
      ? monsterData.key
      : undefined;

  return (
    <HeroTokenProvider
      key={activeStatblockName ?? "none"}
      statblockName={
        isHeroData(monsterData) ? activeStatblockName ?? null : null
      }
      itemId={itemIdParam}
    >
      <HeroClassResourceNamesContext value={heroClassResourceNames}>
        <div className="bg-mirage-50 flex h-screen flex-col overflow-hidden">
          {collapsed ? (
            <></>
          ) : monsterData === undefined ? (
            <div className="text-foreground-secondary grow p-4">Loading...</div>
          ) : monsterData === null ? (
            <div className="text-foreground-secondary grow p-4">
              Failed to Load.
            </div>
          ) : (
            <MonsterView bundle={monsterData} />
          )}

          <PluginReadyGate>
            <div style={{ height }} />
            <div className="absolute right-0 bottom-0 left-0">
              <HeightMatch setHeight={(height) => setHeight(height)}>
                <DiceDrawer />

                <div
                  className={cn(
                    "border-mirage-300 bg-mirage-50 flex flex-wrap justify-end gap-x-2 gap-y-2 overflow-hidden px-4 py-2",
                    { "border-t": !collapsed },
                  )}
                >
                  {monsterData !== undefined && (
                    <div className={cn({ hidden: collapsed }, "max-w-full grow")}>
                      {!collapsed && isHeroData(monsterData) && (
                        <ClassResourceBar key={activeStatblockName ?? "none"} />
                      )}
                      <StatBlockSwitcher
                        monsterData={monsterData}
                        setMonsterData={setMonsterData}
                        setCollapsed={setCollapsed}
                      />
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex grow basis-0 items-center justify-end gap-2",
                      { grow: collapsed },
                    )}
                  >
                    {!collapsed && (
                      <OpenInNewTab
                        resourceId={resourceId}
                        statblockName={activeStatblockName ?? undefined}
                      />
                    )}
                    <Toggle
                      variant={"default"}
                      size={"icon"}
                      pressed={collapsed}
                      className="data-[state=on]:bg-mirage-100 data-[state=on]:text-foreground hover:data-[state=on]:bg-mirage-200 grow"
                      onClick={async () => {
                        if (collapsed) {
                          await OBR.popover.setHeight(
                            getPluginId("statblockViewer"),
                            5000,
                          );
                          await OBR.popover.setWidth(
                            getPluginId("statblockViewer"),
                            500,
                          );
                        } else {
                          await OBR.popover.setHeight(
                            getPluginId("statblockViewer"),
                            56,
                          );
                          await OBR.popover.setWidth(
                            getPluginId("statblockViewer"),
                            300,
                          );
                        }
                        setCollapsed(!collapsed);
                      }}
                    >
                      {collapsed ? <Maximize2Icon /> : <Minimize2Icon />}
                    </Toggle>
                  </div>
                </div>
              </HeightMatch>
            </div>
          </PluginReadyGate>
        </div>
      </HeroClassResourceNamesContext>
    </HeroTokenProvider>
  );
}

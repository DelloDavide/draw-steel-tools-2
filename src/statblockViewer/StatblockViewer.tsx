import "./../index.css";
import MonsterView from "./creatureBlockUI/MonsterView.tsx";
import Button from "../components/ui/Button.tsx";
import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../helpers/getPluginId.ts";
import type { MonsterDataBundle } from "../types/monsterDataBundlesZod.ts";
import type { HeroDataBundle } from "../types/heroDataBundlesZod.ts";
import { Maximize2Icon, Minimize2Icon } from "lucide-react";
import { StatBlockSwitcher } from "./StatblockSwitcher.tsx";
import { useEffect, useState } from "react";
import { monsterDataFromStatblockName } from "../helpers/monsterDataFromStatblockName.ts";
import { heroDataFromStatblockName } from "../helpers/heroDataFromStatblockName.ts";
import { cn } from "../helpers/utils.ts";
import Toggle from "../components/ui/Toggle.tsx";
import { OpenInNewTab } from "./OpenInNewTabButton.tsx";
import HeightMatch from "../components/logic/HeightMatch.tsx";
import { PluginReadyGate } from "../components/logic/PluginReadyGate.tsx";
import { DiceDrawer } from "./DiceDrawer.tsx";

const statblockName = new URLSearchParams(document.location.search).get(
  "statblockName",
);

type CreatureDataBundle = MonsterDataBundle | HeroDataBundle;

export function StatblockViewer() {
  const [collapsed, setCollapsed] = useState(false);
  const [monsterData, setMonsterData] = useState<CreatureDataBundle | null>();
  const [height, setHeight] = useState(57);

  useEffect(() => {
    const loadData = async () => {
      if (!statblockName) {
        setMonsterData(null);
        return;
      }
      try {
        const heroData = await heroDataFromStatblockName(statblockName);
        document.title = heroData.statblock.name;
        setMonsterData(heroData);
        return;
      } catch {
        // If not found in hero index, fall back to monsters.
      }

      const monsterData = await monsterDataFromStatblockName(statblockName);
      document.title = monsterData.statblock.name;
      setMonsterData(monsterData);
    };

    void loadData();
  }, []);

  return (
    <div className="bg-mirage-50 flex h-screen flex-col overflow-hidden">
      {collapsed ? (
        <></>
      ) : monsterData === undefined ? (
        <div className="text-foreground-secondary grow p-4">Loading...</div>
      ) : monsterData === null ? (
        <div className="text-foreground-secondary grow p-4"></div>
      ) : (
        <MonsterView monsterData={monsterData} />
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
                  {
                    grow: collapsed,
                  },
                )}
              >
                {!collapsed && (
                  <OpenInNewTab statblockName={monsterData?.statblock.name} />
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
                        180,
                      );
                    }
                    setCollapsed(!collapsed);
                  }}
                >
                  {collapsed ? <Maximize2Icon /> : <Minimize2Icon />}
                </Toggle>
                <Button
                  variant={"primary"}
                  className="h-10"
                  onClick={() =>
                    OBR.popover.close(getPluginId("statblockViewer"))
                  }
                >
                  Close
                </Button>
              </div>
            </div>
          </HeightMatch>
        </div>
      </PluginReadyGate>
    </div>
  );
}

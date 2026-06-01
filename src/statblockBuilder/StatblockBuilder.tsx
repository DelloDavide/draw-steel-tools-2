import { useState, useEffect } from "react";
import { heroDataFromStatblockName } from "../helpers/heroDataFromStatblockName";
import { monsterDataFromStatblockName } from "../helpers/monsterDataFromStatblockName";
import type { HeroDataBundle } from "../types/heroDataBundlesZod";
import type { MonsterDataBundle } from "../types/monsterDataBundlesZod";
import MonsterEditorView from "./creatureBlockUI/MonsterEditorView";

const params = new URLSearchParams(document.location.search);
const statblockName =
  params.get("statblockName") ?? params.get("statblock") ?? null;
const statblockType = params.get("type");

type CreatureDataBundle =
  | (MonsterDataBundle & { kind: "monster" })
  | (HeroDataBundle & { kind: "hero" });

export function StatblockBuilder() {
  const [monsterData, setMonsterData] = useState<CreatureDataBundle | null>();

  useEffect(() => {
    const loadData = async () => {
      if (!statblockName) {
        setMonsterData(null);
        return;
      }
      const notFoundMessage = "Could not find statblock with name";

      const loadHero = async () => {
        const heroData = await heroDataFromStatblockName(statblockName);
        document.title = heroData.statblock.name;
        setMonsterData({ ...heroData, kind: "hero" });
      };

      const loadMonster = async () => {
        const monsterData = await monsterDataFromStatblockName(statblockName);
        document.title = monsterData.statblock.name;
        setMonsterData({ ...monsterData, kind: "monster" });
      };

      const firstLoad = statblockType === "monster" ? loadMonster : loadHero;
      const fallbackLoad = statblockType === "monster" ? loadHero : loadMonster;

      try {
        await firstLoad();
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (!message.includes(notFoundMessage)) {
          console.error(error);
          setMonsterData(null);
          return;
        }
      }

      try {
        await fallbackLoad();
      } catch (error) {
        console.error(error);
        setMonsterData(null);
      }
    };

    void loadData();
  }, []);

  if (monsterData === undefined) return null;
  if (monsterData === null)
    return (
      <div className="text-foreground flex h-screen items-center justify-center p-4">
        No statblock selected. Use <code>?statblockName=…&type=hero|monster</code>{" "}
        in the URL.
      </div>
    );
  return (
    <div className="bg-mirage-50 flex h-screen flex-col overflow-hidden">
      <MonsterEditorView monsterData={monsterData} />
    </div>
  );
}

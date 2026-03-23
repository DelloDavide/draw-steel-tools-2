import { useState, useEffect } from "react";
import { monsterDataFromStatblockName } from "../helpers/monsterDataFromStatblockName";
import type { MonsterDataBundle } from "../types/monsterDataBundlesZod";
import MonsterEditorView from "./creatureBlockUI/MonsterEditorView";

const statblockName = "Human Blackguard";
// const statblockName = "Bugbear Channeler";

export function StatblockBuilder() {
  const [monsterData, setMonsterData] = useState<MonsterDataBundle | null>();

  useEffect(() => {
    if (!statblockName) {
      setMonsterData(null);
      return;
    }
    monsterDataFromStatblockName(statblockName).then((monsterData) => {
      document.title = monsterData.statblock.name;
      setMonsterData(monsterData);
    });
  }, []);

  if (!monsterData) return "not found";
  return (
    <div className="bg-mirage-50 flex h-screen flex-col overflow-hidden">
      <MonsterEditorView monsterData={monsterData} />
    </div>
  );

  // if (!monsterData?.statblock) return "not found";
  // return <StatBlock statblock={monsterData.statblock} />;
}

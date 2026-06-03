import type { MonsterDataBundle } from "../../types/monsterDataBundlesZod";
import type { HeroDataBundle } from "../../types/heroDataBundlesZod";
import { FeatureBlock } from "./FeatureBlock";
import { SkillBlock } from "./SkillBlock";
import { InventoryBlock } from "./InventoryBlock";
import { StatBlock } from "./StatBlock";
import { ScrollArea } from "../../components/ui/scrollArea";
import { Images } from "./Images";
import { ProjectBlock } from "./ProjectBlock";
import defaultMalice from "../defaultMalice.json";
import { DrawSteelFeatureBlockZod } from "../../types/DrawSteelZod";
import { useState } from "react";
import { capitalizeFirstLetter } from "../../helpers/others";
import {
  saveHeroProjectsToGitHub,
  saveHeroProjectsToSupabase,
} from "../../helpers/saveHeroProjects";

const parsedDefaultMaliceFeatures =
  DrawSteelFeatureBlockZod.parse(defaultMalice);

type CreatureDataBundle =
  | (MonsterDataBundle & { kind: "monster" })
  | (HeroDataBundle & { kind: "hero" });

export default function MonsterView({
  monsterData,
}: {
  monsterData: CreatureDataBundle;
}) {
  const [data, setData] = useState(monsterData);

  function addProgress(projectName: string, delta: number) {
    setData((prev) => ({
      ...prev,
      projectBlocks: prev.projectBlocks.map((block) => ({
        ...block,
        projects: block.projects.map((p) =>
          p.name === projectName
            ? {
                ...p,
                progress: Math.min(
                  p.completion,
                  Math.max(0, p.progress + delta),
                ),
              }
            : p,
        ),
      })),
    }));
  }

  async function saveProjects() {
    if (data.kind !== "hero") return;

    const heroName = data.statblock.name;
    const updatedAt = new Date().toISOString();

    try {
      await saveHeroProjectsToGitHub(
        data.statblock.name,
        data.projectBlocks,
        updatedAt,
      );

      await saveHeroProjectsToSupabase(heroName, data.projectBlocks, updatedAt);

      alert(
        `The ${capitalizeFirstLetter(data.kind)} ${data.statblock.name} Updated Their Projects Successfully!`,
      );
    } catch (err) {
      console.error(err);
      alert(
        `Error saving projects for the ${capitalizeFirstLetter(data.kind)} ${data.statblock.name}`,
      );
    }
  }

  return (
    <div className="flex grow flex-col">
      <ScrollArea className="grow basis-0">
        <div className="bg-mirage-50 grid justify-items-center gap-y-8 p-4 text-sm text-black">
          <Images images={data.images} />
          <StatBlock statblock={data.statblock} />

          <div className="grid h-fit w-full justify-items-center gap-8">
            {data.featuresBlocks.length > 0 &&
              data.featuresBlocks.map((item) => (
                <FeatureBlock
                  key={item.name + item.level}
                  featureBlock={item}
                />
              ))}

            {data.skillsBlocks.length > 0 &&
              data.skillsBlocks.map((item) => (
                <SkillBlock key={item.name} skillBlock={item} />
              ))}

            <div className="mb-0.5 w-full border-b border-mirage-950" />

            {data.inventoryBlocks.length > 0 &&
              data.inventoryBlocks.map((item) => (
                <InventoryBlock key={item.name} inventoryBlock={item} />
              ))}

            <div className="mb-0.5 w-full border-b border-mirage-950" />

            {data.projectBlocks.length > 0 &&
              data.projectBlocks.map((item) => (
                <div key={item.name} className="w-full">
                  <ProjectBlock projectBlock={item} onProgress={addProgress} />
                </div>
              ))}

            {data.projectBlocks.length > 0 && data.kind === "hero" && (
              <button
                onClick={saveProjects}
                className="rounded bg-green-700 px-3 py-2 text-white hover:bg-green-600"
              >
                Update Projects Points
              </button>
            )}

            {data.kind === "monster" && (
              <FeatureBlock featureBlock={parsedDefaultMaliceFeatures} />
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

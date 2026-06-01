import type { MonsterDataBundle } from "../../types/monsterDataBundlesZod";
import type { HeroDataBundle } from "../../types/heroDataBundlesZod";
import { FeatureBlock } from "./FeatureBlock";
import { SkillBlock } from "./SkillBlock";
import { StatBlock } from "./StatBlock";
import { ScrollArea } from "../../components/ui/scrollArea";
import { Images } from "./Images";
import { ProjectBlock } from "./ProjectBlock";
import defaultMalice from "../defaultMalice.json";
import { DrawSteelFeatureBlockZod } from "../../types/DrawSteelZod";
import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { setTypedDataCache } from "../../statblockSearch/helpers/getTypedData";

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
                  Math.max(0, p.progress + delta)
                ),
              }
            : p
        ),
      })),
    }));
  }

  async function saveProjects() {
    const heroName = data.statblock.name;
    const projectPaths = data.projectBlocks.map(
      () =>
        `Heroes/${heroName}/Projects/${heroName} Projects.json`,
    );

    try {
      for (let i = 0; i < data.projectBlocks.length; i++) {
        const block = data.projectBlocks[i];
        const path = projectPaths[i];
        const updated = {
          ...block,
          updated_at: new Date().toISOString(),
        };

        const { error: writeError } = await supabase
          .from("bestiary_documents")
          .update({
            content: updated,
            updated_at: new Date().toISOString(),
          })
          .eq("path", path);

        if (writeError) {
          throw new Error(`Write error: ${writeError.message}`);
        }

        setTypedDataCache(path, updated);
      }

      alert("Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving projects");
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

            <div className="mb-0.5 w-full border-b border-zinc-950" />

            {data.projectBlocks.length > 0 &&
              data.projectBlocks.map((item) => (
                <div key={item.name} className="w-full">
                  <ProjectBlock
                    projectBlock={item}
                    onProgress={addProgress}
                  />
                </div>
              ))}

            {data.projectBlocks.length > 0 && data.kind === "hero" && (
              <button onClick={saveProjects} className="rounded bg-green-700 px-3 py-2 text-white hover:bg-green-600">
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

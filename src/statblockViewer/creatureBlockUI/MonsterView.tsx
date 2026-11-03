import type { CreatureDataBundle } from "../../types/creatureDataBundle";
import { extractClassResourceNamesFromHeroBundle } from "../../helpers/classResourceHelpers";
import { HeroClassResourceNamesContext } from "../context/HeroClassResourceNamesContext";
import { FeatureBlock } from "./FeatureBlock";
import { SkillBlock } from "./SkillBlock";
import { InventoryBlock } from "./InventoryBlock";
import { StatBlock } from "./StatBlock";
import { DynamicTerrainStatBlock } from "./DynamicTerrainStatBlock";
import type { DrawSteelResourceBundle } from "../../types/monsterDataBundlesZod";
import { ScrollArea } from "../../components/ui/scrollArea";
import { Images } from "./Images";
import { ProjectBlock } from "./ProjectBlock";
import defaultMalice from "../defaultMalice.json";
import {
  DrawSteelFeatureBlockZod,
  type DrawSteelInventoryBlock,
  type DrawSteelProjectBlock,
  type DrawSteelSkillBlock,
  type DrawSteelStatblock,
} from "../../types/DrawSteelZod";
import { useEffect, useState, useMemo } from "react";
import { capitalizeFirstLetter } from "../../helpers/others";
import {
  saveHeroProjectsToGitHub,
  saveHeroProjectsToSupabase,
} from "../../helpers/saveHeroProjects";
import {
  saveInventoryToGitHub,
  saveInventoryToSupabase,
} from "../../helpers/saveHeroInventory";
import {
  saveSkillsToGitHub,
  saveSkillsToSupabase,
} from "../../helpers/saveHeroSkills";
import { saveHeroProgressionStats } from "../../helpers/saveHeroProgressionStats";
import { ResourceTypeAdaptor } from "./ResourceTypeAdapter";

const parsedDefaultMaliceFeatures =
  DrawSteelFeatureBlockZod.parse(defaultMalice);

function LegacyMonsterView({
  monsterData,
}: {
  readonly monsterData: CreatureDataBundle;
}) {
  const [data, setData] = useState<CreatureDataBundle>(monsterData);

  const [originalProjectBlocks, setOriginalProjectBlocks] = useState(
    monsterData.kind === "dynamicterrain" ? [] : monsterData.projectBlocks,
  );

  useEffect(() => {
    setData(monsterData);

    if (monsterData.kind !== "dynamicterrain") {
      setOriginalProjectBlocks(monsterData.projectBlocks);
    }
  }, [monsterData]);

  const heroClassResourceNames = useMemo(
    () =>
      data.kind === "hero" ? extractClassResourceNamesFromHeroBundle(data) : [],
    [data],
  );

  const hasProjectChanges = useMemo(() => {
    if (data.kind !== "hero") return false;

    return (
      JSON.stringify(data.projectBlocks) !==
      JSON.stringify(originalProjectBlocks)
    );
  }, [data, originalProjectBlocks]);

  function addProgress(projectName: string, delta: number) {
    setData((prev) => {
      if (prev.kind === "dynamicterrain") return prev;
      return {
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
      };
    });
  }

  async function saveSkills(updatedBlock: DrawSteelSkillBlock) {
    if (data.kind !== "hero") return;

    const heroName = data.statblock.name;
    const updatedAt = new Date().toISOString();

    try {
      await saveSkillsToGitHub(heroName, updatedBlock, updatedAt);
      await saveSkillsToSupabase(heroName, updatedBlock, updatedAt);

      setData((prev) => {
        if (prev.kind === "dynamicterrain") return prev;
        return {
          ...prev,
          skillsBlocks: prev.skillsBlocks.map((b) =>
            b.name === updatedBlock.name ? updatedBlock : b,
          ),
        };
      });

      alert(
        `The ${capitalizeFirstLetter(data.kind)} ${heroName} Updated Their Skills Successfully!`,
      );
    } catch (err) {
      console.error(err);
      alert(
        `Error saving skills for the ${capitalizeFirstLetter(data.kind)} ${heroName}`,
      );
    }
  }

  async function saveInventory(updatedBlock: DrawSteelInventoryBlock) {
    if (data.kind !== "hero") return;

    const heroName = data.statblock.name;
    const updatedAt = new Date().toISOString();

    try {
      await saveInventoryToGitHub(heroName, updatedBlock, updatedAt);
      await saveInventoryToSupabase(heroName, updatedBlock, updatedAt);

      // aggiorna lo stato locale con il blocco salvato
      setData((prev) => {
        if (prev.kind === "dynamicterrain") return prev;
        return {
          ...prev,
          inventoryBlocks: prev.inventoryBlocks.map((b) =>
            b.name === updatedBlock.name ? updatedBlock : b,
          ),
        };
      });

      alert(
        `The ${capitalizeFirstLetter(data.kind)} ${heroName} Updated Their Inventory Successfully!`,
      );
    } catch (err) {
      console.error(err);
      alert(
        `Error saving inventory for the ${capitalizeFirstLetter(data.kind)} ${heroName}`,
      );
    }
  }

  async function saveProjectsPoints() {
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

      setOriginalProjectBlocks(data.projectBlocks);

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

  async function saveProgressionStats(
    stats: Pick<DrawSteelStatblock, "victories" | "experience_points">,
  ) {
    if (data.kind !== "hero") return;

    const updatedStatblock = { ...data.statblock, ...stats };
    await saveHeroProgressionStats(data.statblock.name, updatedStatblock);
    setData((current) =>
      current.kind === "hero"
        ? { ...current, statblock: updatedStatblock }
        : current,
    );
  }

  async function saveProjectBlock(updatedBlock: DrawSteelProjectBlock) {
    if (data.kind !== "hero") return;

    const heroName = data.statblock.name;
    const updatedAt = new Date().toISOString();

    try {
      await saveHeroProjectsToGitHub(heroName, [updatedBlock], updatedAt);
      await saveHeroProjectsToSupabase(heroName, [updatedBlock], updatedAt);

      setData((prev) => {
        if (prev.kind === "dynamicterrain") return prev;
        return {
          ...prev,
          projectBlocks: prev.projectBlocks.map((b) =>
            b.name === updatedBlock.name ? updatedBlock : b,
          ),
        };
      });

      setOriginalProjectBlocks((prev) =>
        prev.map((b) => (b.name === updatedBlock.name ? updatedBlock : b)),
      );

      alert(
        `The ${capitalizeFirstLetter(data.kind)} ${heroName} Updated Their Projects Successfully!`,
      );
    } catch (err) {
      console.error(err);
      alert(
        `Error saving projects for the ${capitalizeFirstLetter(data.kind)} ${heroName}`,
      );
    }
  }

  return (
    <HeroClassResourceNamesContext value={heroClassResourceNames}>
      <div className="flex grow flex-col">
        <ScrollArea className="grow basis-0">
          <div className="bg-mirage-50 grid justify-items-center gap-y-8 p-4 text-sm text-black">
            {data.kind === "dynamicterrain" ? (
              <DynamicTerrainStatBlock terrain={data.terrain} />
            ) : (
              <>
                <Images images={data.images} />
                <StatBlock
                  statblock={data.statblock}
                  onSaveProgression={
                    data.kind === "hero" ? saveProgressionStats : undefined
                  }
                />

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
                      <SkillBlock
                        key={item.name}
                        skillBlock={item}
                        onSave={saveSkills}
                      />
                    ))}

                  <div className="border-mirage-950 mb-0.5 w-full max-w-lg justify-self-center border-b" />

                  {data.inventoryBlocks.length > 0 &&
                    data.inventoryBlocks.map((item) => (
                      <InventoryBlock
                        key={item.name}
                        inventoryBlock={item}
                        onSave={saveInventory}
                      />
                    ))}

                  <div className="border-mirage-950 mb-0.5 w-full max-w-lg justify-self-center border-b" />

                  {data.projectBlocks.length > 0 &&
                    data.projectBlocks.map((item) => (
                      <ProjectBlock
                        key={item.name}
                        projectBlock={item}
                        onProgress={addProgress}
                        onSave={saveProjectBlock}
                      />
                    ))}

                  {data.projectBlocks.length > 0 && data.kind === "hero" && (
                    <button
                      onClick={saveProjectsPoints}
                      disabled={!hasProjectChanges}
                      className={`rounded px-3 py-2 text-white ${
                        hasProjectChanges
                          ? "bg-green-700 hover:bg-green-600"
                          : "cursor-not-allowed bg-gray-500"
                      }`}
                    >
                      Update Projects Points
                    </button>
                  )}

                  {data.kind === "monster" && (
                    <FeatureBlock featureBlock={parsedDefaultMaliceFeatures} />
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </HeroClassResourceNamesContext>
  );
}

function ResourceBundleView({
  bundle,
}: {
  readonly bundle: DrawSteelResourceBundle;
}) {
  return (
    <div className="flex grow flex-col">
      <ScrollArea className="grow basis-0">
        <div className="bg-mirage-50 grid justify-items-center gap-y-8 p-4 text-sm text-black">
          <ResourceTypeAdaptor resource={bundle.resource} />

          <div className="grid h-fit w-full justify-items-center gap-8">
            {bundle.append &&
              bundle.append.length > 0 &&
              bundle.append.map((item) => (
                <ResourceTypeAdaptor
                  key={item.name + item.level}
                  resource={item}
                />
              ))}
            {bundle.resource.type === "statblock" && (
              <FeatureBlock featureBlock={parsedDefaultMaliceFeatures} />
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default function MonsterView({
  bundle,
}: {
  readonly bundle: CreatureDataBundle | DrawSteelResourceBundle;
}) {
  return "kind" in bundle ? (
    <LegacyMonsterView monsterData={bundle} />
  ) : (
    <ResourceBundleView bundle={bundle} />
  );
}

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
import { capitalizeFirstLetter } from "../../helpers/others";

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

  async function saveToGitHub() {
    const token = import.meta.env.VITE_GITHUB_TOKEN;

    if (!token) {
      alert("Missing GitHub token");
      return;
    }

    const filePath = "Heroes/Degotho/Projects/Degotho Projects.json";

    const apiUrl = `https://api.github.com/repos/DelloDavide/data-bestiary-json/contents/${filePath}`;

    try {
      const getRes = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      });

      const fileData = await getRes.json();

      const sha = fileData.sha;

      const decoded = JSON.parse(
        new TextDecoder().decode(
          Uint8Array.from(atob(fileData.content), (c) => c.charCodeAt(0)),
        ),
      );

      const updated = {
        ...decoded,
        projects: decoded.projects.map((project: any) => {
          const localProject = data.projectBlocks
            .flatMap((b) => b.projects)
            .find((p) => p.name === project.name);

          return localProject
            ? {
                ...project,
                progress: localProject.progress,
              }
            : project;
        }),
      };

      const encoded = btoa(
        unescape(encodeURIComponent(JSON.stringify(updated, null, 2))),
      );

      const updateRes = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `The ${capitalizeFirstLetter(data.kind)} ${data.statblock.name} Updated Theirs Projects`,
          content: encoded,
          sha,
        }),
      });

      if (!updateRes.ok) {
        throw new Error("GitHub update failed");
      }

      alert("Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving to GitHub");
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
                <ProjectBlock
                  key={item.name}
                  projectBlock={item}
                  onProgress={addProgress}
                />
              ))}

            {data.projectBlocks.length > 0 && data.kind === "hero" && (
              <button onClick={saveToGitHub} className="rounded bg-green-700 px-3 py-2 text-white hover:bg-green-600">
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

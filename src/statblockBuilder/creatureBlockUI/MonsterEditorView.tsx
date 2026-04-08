import type { MonsterDataBundle } from "../../types/monsterDataBundlesZod";
import { FeatureBlock } from "./FeatureBlock";
import { SkillBlock } from "./SkillBlock";
import { StatBlock } from "./StatBlock";
import { ScrollArea } from "../../components/ui/scrollArea";

export default function MonsterEditorView({
  monsterData: monsterData,
}: {
  monsterData: MonsterDataBundle;
}) {
  return (
    <div className="flex grow flex-col">
      <ScrollArea className="grow basis-0">
        <div className="bg-mirage-50 grid justify-items-center gap-y-8 p-4 text-sm text-black">
          <StatBlock statblock={monsterData.statblock} />

          <div className="grid h-fit w-full justify-items-center gap-8">
            {monsterData.featuresBlocks.length > 0 &&
              monsterData.featuresBlocks.map((item) => (
                <FeatureBlock
                  key={item.name + item.level}
                  featureBlock={item}
                />
              ))}

            {monsterData.skillsBlocks.length > 0 &&
              monsterData.skillsBlocks.map((item) => (
                <SkillBlock 
                  key={item.name} 
                  skillBlock={item} 
                />
              ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

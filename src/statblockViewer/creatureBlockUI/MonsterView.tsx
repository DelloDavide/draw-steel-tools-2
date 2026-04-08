import type { MonsterDataBundle } from "../../types/monsterDataBundlesZod";
import type { HeroDataBundle } from "../../types/heroDataBundlesZod";
import { FeatureBlock } from "./FeatureBlock";
import { SkillBlock } from "../../statblockBuilder/creatureBlockUI/SkillBlock";
import { StatBlock } from "./StatBlock";
import { ScrollArea } from "../../components/ui/scrollArea";
import defaultMalice from "../defaultMalice.json";
import { DrawSteelFeatureBlockZod } from "../../types/DrawSteelZod";

const parsedDefaultMaliceFeatures =
  DrawSteelFeatureBlockZod.parse(defaultMalice);

type CreatureDataBundle =
  | (MonsterDataBundle & { kind: "monster" })
  | (HeroDataBundle & { kind: "hero" });

export default function MonsterView({
  monsterData: monsterData,
}: {
  monsterData: CreatureDataBundle;
}) {
  const url = new URL(window.location.href);
  url.searchParams.delete("statblock");

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
                <SkillBlock key={item.name} skillBlock={item} />
              ))}
            {monsterData.kind === "monster" && (
              <FeatureBlock featureBlock={parsedDefaultMaliceFeatures} />
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

import { targetArrow } from "@lucide/lab";
import {
  SkullIcon,
  AlertCircleIcon,
  SwordIcon,
  BowArrowIcon,
  UserIcon,
  Ruler,
  Icon,
  StarIcon,
  Grid3X3Icon,
} from "lucide-react";
import { Effect } from "./Effect";
import type { DrawSteelFeature } from "../../types/DrawSteelZod";
import { useContext } from "react";
import { SetRollAttributesContext } from "../context/RollAttributesContext";
import { PluginReadyGate } from "../../components/logic/PluginReadyGate";
import {
  DiceDrawerContext,
  SetDiceDrawerContext,
  type DiceDrawer,
} from "../context/DiceDrawerContext";
import Button from "../../components/ui/Button";
import { ResultDropDown } from "./ResultDropDown";
import { MaliceSpender } from "./MaliceSpender";
import parseNumber from "../../helpers/parseNumber";
import { MaliceSpentIndicator } from "./MaliceSpentIndicator";
import { MaliceSpentContext } from "../context/MaliceSpentContext";
import { FeatureIdContext } from "../context/FeatureIdContext";
import { RollResultIndicator } from "./RollResultIndicator";

export function Feature({
  blockName,
  feature: feature,
}: {
  blockName: string;
  feature: DrawSteelFeature;
}) {
  const setRollAttributes = useContext(SetRollAttributesContext);
  const diceDrawer = useContext(DiceDrawerContext);
  const setDiceDrawer = useContext(SetDiceDrawerContext);
  const maliceSpent = useContext(MaliceSpentContext);

  const featureId = blockName + feature.name;

  const isPowerRollResultTarget =
    diceDrawer.powerRollResultTargetId === featureId;
  const highlightTier =
    isPowerRollResultTarget && diceDrawer.powerRollResult
      ? diceDrawer.powerRollResult.tier
      : undefined;

  const isRollResultTarget = diceDrawer.rollResultTargetId === featureId;

  let roll: string | undefined = undefined;
  let rollBonus: string = "";
  feature.effects.forEach((val) => {
    if ("roll" in val && val.roll) {
      roll = val.roll.replace("Power Roll", "2d10");
      rollBonus = val.roll.replace("Power Roll", "").replace(/\s/g, "");
    }
  });

  return (
    <FeatureIdContext value={featureId}>
      <div className="ml-5 flex">
        <div className="w-full">
          <div className="w-full space-y-2">
            <div>
              <div className="flex min-h-6 flex-wrap items-center justify-between">
                <div className="flex flex-wrap items-center gap-1">
                  <div className="-ml-6 flex size-[20px] items-center justify-center">
                    {(() => {
                      if (feature.icon === "☠️") return <SkullIcon />;
                      if (feature.icon === "❗️") return <AlertCircleIcon />;
                      if (feature.icon === "🔳") return <Grid3X3Icon />;
                      if (feature.icon === "🗡") return <SwordIcon />;
                      if (feature.icon === "🏹") return <BowArrowIcon />;
                      if (feature.icon === "⭐️") return <StarIcon />;
                      return <UserIcon />;
                    })()}
                  </div>
                  <div className="font-black">{feature.name}</div>
                  <PluginReadyGate alternate={<div>{roll}</div>}>
                    {roll && (
                      <Button
                        variant={"outline"}
                        size={"xs"}
                        className="px-3 text-nowrap"
                        onClick={() => {
                          setRollAttributes((prev) => ({
                            ...prev,
                            bonus: parseFloat(rollBonus),
                          }));
                          setDiceDrawer(
                            (prev) =>
                              ({
                                ...prev,
                                open: true,
                                powerRollTargetId: featureId,
                                powerRollTargetName: feature.name,
                              }) satisfies DiceDrawer,
                          );
                        }}
                      >
                        {roll}
                      </Button>
                    )}
                  </PluginReadyGate>
                </div>
                {feature.cost && (
                  <PluginReadyGate
                    alternate={<div className="font-black">{feature.cost}</div>}
                  >
                    <MaliceSpender
                      trigger={
                        <Button
                          variant={"outline"}
                          size={"xs"}
                          className="font-black"
                        >
                          {feature.cost}
                        </Button>
                      }
                      cost={parseNumber(feature.cost)}
                    />
                  </PluginReadyGate>
                )}
                {feature.ability_type && (
                  <div className="font-black">{feature.ability_type}</div>
                )}
              </div>
              <div className="flex flex-wrap justify-between">
                <div>{feature.keywords?.join(", ")}</div>
                <div>{feature.usage}</div>
              </div>
              {(feature.distance || feature.target) && (
                <div className="flex flex-wrap justify-between">
                  <div className="flex items-center gap-1">
                    <Ruler className="size-4" />
                    <div>{feature.distance}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon iconNode={targetArrow} className="size-4 shrink-0" />
                    <div>{feature.target}</div>
                  </div>
                </div>
              )}
            </div>
            {feature.trigger && (
              <div>
                <span className="font-semibold">{"Trigger: "}</span>
                {feature.trigger}
              </div>
            )}
            {feature.effects.length > 0 && (
              <div className="space-y-2">
                {feature.effects.map((effect, index) => (
                  <Effect
                    key={index}
                    effect={effect}
                    highlightTier={index < 2 ? highlightTier : undefined}
                  />
                ))}
              </div>
            )}
            {feature.flavor && <div className="italic">{feature.flavor}</div>}
          </div>
          {maliceSpent?.target === featureId && (
            <MaliceSpentIndicator maliceSpent={maliceSpent.value} />
          )}
          {isRollResultTarget && (
            <RollResultIndicator
              rollText={diceDrawer.rollText}
              rollResult={diceDrawer.rollResult}
            />
          )}
          <ResultDropDown
            hidden={isPowerRollResultTarget}
            result={diceDrawer.powerRollResult}
          />
        </div>
      </div>
    </FeatureIdContext>
  );
}

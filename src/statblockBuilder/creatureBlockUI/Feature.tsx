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
import { Input } from "./Input";
import FreeWheelInput from "../../components/logic/FreeWheelInput";

export function Feature({
  feature: feature,
}: {
  blockName: string;
  feature: DrawSteelFeature;
}) {
  let roll: string | undefined = undefined;
  feature.effects.forEach((val) => {
    if ("roll" in val && val.roll) {
      roll = val.roll.replace("Power Roll", "2d10");
    }
  });

  return (
    <div className="flex gap-1">
      <button className="bg-accent text-accent-foreground flex size-[32px] items-center justify-center rounded-2xl p-1">
        {(() => {
          if (feature.icon === "☠️") return <SkullIcon />;
          if (feature.icon === "❗️") return <AlertCircleIcon />;
          if (feature.icon === "🔳") return <Grid3X3Icon />;
          if (feature.icon === "🗡") return <SwordIcon />;
          if (feature.icon === "🏹") return <BowArrowIcon />;
          if (feature.icon === "⭐️") return <StarIcon />;
          return <UserIcon />;
        })()}
      </button>
      <div className="w-full">
        <div className="w-full space-y-2">
          <div className="space-y-2">
            <div className="flex flex-wrap justify-between gap-4">
              <Input>
                <FreeWheelInput
                  className="grow font-black"
                  placeholder="Name"
                  value={feature.name}
                  onUpdate={() => {}}
                />
              </Input>
              <Input>
                <FreeWheelInput
                  placeholder="Type or Cost"
                  value={
                    (feature.cost ? feature.cost : "") +
                    (feature.ability_type ? feature.ability_type : "")
                  }
                  onUpdate={() => {}}
                />
              </Input>
            </div>
            <div className="flex flex-wrap justify-between gap-4">
              <Input>
                <FreeWheelInput
                  className="grow"
                  placeholder="Keywords"
                  value={feature.keywords ? feature.keywords.join(", ") : ""}
                  onUpdate={() => {}}
                />
              </Input>
              <Input>
                <FreeWheelInput
                  placeholder="Usage"
                  value={feature.usage ? feature.usage : ""}
                  onUpdate={() => {}}
                />
              </Input>
            </div>

            <div className="flex flex-wrap justify-between gap-4">
              <div className="flex grow items-center gap-1">
                <Ruler className="size-4" />
                <Input>
                  <FreeWheelInput
                    className="grow"
                    placeholder="Range"
                    value={feature.distance ? feature.distance : ""}
                    onUpdate={() => {}}
                  />
                </Input>
              </div>
              <div className="flex items-center gap-1">
                <Icon iconNode={targetArrow} className="size-4 shrink-0" />
                <Input>
                  <FreeWheelInput
                    placeholder="Target"
                    value={feature.target ? feature.target : ""}
                    onUpdate={() => {}}
                  />
                </Input>
              </div>
            </div>
          </div>
          {feature.usage && feature.usage.search(/[t|T]rig/g) !== -1 && (
            <div className="flex items-center gap-1">
              <div className="font-semibold">{"Trigger"}</div>
              <Input>
                <FreeWheelInput
                  className="grow"
                  placeholder="Target"
                  value={feature.trigger ? feature.trigger : ""}
                  onUpdate={() => {}}
                />
              </Input>
            </div>
          )}
          {feature.effects.length > 0 && (
            <div className="space-y-2">
              {feature.effects.map((effect, index) => (
                <Effect key={index} effect={effect} />
              ))}
            </div>
          )}
          {feature.flavor && <div className="italic">{feature.flavor}</div>}
        </div>
      </div>
    </div>
  );
}

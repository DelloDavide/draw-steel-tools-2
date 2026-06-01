import { useContext, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import Button from "../../components/ui/Button";
import { EqualIcon, MinusIcon } from "lucide-react";
import Input from "../../components/ui/Input";
import FreeWheelInput from "../../components/logic/FreeWheelInput";
import Label from "../../components/ui/Label";
import parseNumber from "../../helpers/parseNumber";
import { PopoverClose } from "@radix-ui/react-popover";
import { FeatureIdContext } from "../context/FeatureIdContext";
import {
  HeroTokenContext,
  SetHeroResourceSpentContext,
  UpdateHeroClassResourceContext,
} from "../context/HeroTokenContext";
import { getMergedClassResourcePools } from "../../helpers/classResourceHelpers";

export function HeroResourceSpender({
  trigger,
  cost,
  resourceName,
  align = "end",
  side = "top",
  alignOffset,
}: {
  trigger: React.ReactNode;
  cost: number;
  resourceName: string;
  align?: "end" | "center" | "start" | undefined;
  side?: "top" | "right" | "bottom" | "left" | undefined;
  alignOffset?: number | undefined;
}) {
  const linkedHeroToken = useContext(HeroTokenContext);
  const updateClassResource = useContext(UpdateHeroClassResourceContext);
  const setHeroResourceSpent = useContext(SetHeroResourceSpentContext);
  const featureId = useContext(FeatureIdContext);

  const [configuredCost, setConfiguredCost] = useState(cost);

  if (!linkedHeroToken) return <>{trigger}</>;

  const pools = getMergedClassResourcePools(linkedHeroToken.token);
  const current = pools[resourceName] ?? 0;
  const newValue = current - configuredCost;

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) setConfiguredCost(cost);
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        alignOffset={alignOffset}
        className="w-fit rounded-2xl"
      >
        <div aria-label="open focus target" tabIndex={1} />
        <div className="space-y-2">
          <div className="text-sm font-bold">{resourceName}</div>
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label className="w-full">Current</Label>
              <Input hasFocusHighlight className="w-16 text-center">
                <FreeWheelInput
                  clearContentOnFocus
                  value={current.toString()}
                  onUpdate={(target) =>
                    updateClassResource(
                      resourceName,
                      parseNumber(target.value, {
                        min: -999,
                        max: 999,
                        truncate: true,
                      }),
                    )
                  }
                />
              </Input>
            </div>
            <MinusIcon className="h-9" />
            <div className="space-y-1">
              <Label className="center w-full">Cost</Label>
              <Input hasFocusHighlight className="w-16 text-center">
                <FreeWheelInput
                  clearContentOnFocus
                  value={configuredCost.toString()}
                  onUpdate={(target) =>
                    setConfiguredCost(
                      parseNumber(target.value, {
                        min: 0,
                        max: 99,
                        truncate: true,
                      }),
                    )
                  }
                />
              </Input>
            </div>
            <EqualIcon className="h-9" />
            <div className="bg-mirage-100 flex h-9 min-w-12 items-center justify-center self-end rounded-lg">
              {newValue}
            </div>
          </div>
          <PopoverClose asChild>
            <Button
              className="w-full"
              onClick={() => {
                updateClassResource(resourceName, newValue);
                setHeroResourceSpent({
                  target: featureId,
                  resourceName,
                  value: configuredCost,
                });
              }}
            >
              Spend
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useContext, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  RoomTrackersContext,
  UpdateRoomTrackersContext,
} from "../context/RoomTrackersContext";
import Button from "../../components/ui/Button";
import { EqualIcon, MinusIcon } from "lucide-react";
import Input from "../../components/ui/Input";
import FreeWheelInput from "../../components/logic/FreeWheelInput";
import Label from "../../components/ui/Label";
import parseNumber from "../../helpers/parseNumber";
import { PopoverClose } from "@radix-ui/react-popover";
import { SetMaliceSpentContext } from "../context/MaliceSpentContext";
import { FeatureIdContext } from "../context/FeatureIdContext";

export function MaliceSpender({
  trigger,
  cost,
  align = "end",
  side = "top",
  alignOffset,
}: {
  readonly trigger: React.ReactNode;
  readonly cost: number;
  readonly align?: "end" | "center" | "start";
  readonly side?: "top" | "right" | "bottom" | "left";
  readonly alignOffset?: number;
}) {
  const trackerMetadata = useContext(RoomTrackersContext);
  const updateTrackerMetadata = useContext(UpdateRoomTrackersContext);
  const setMaliceSpent = useContext(SetMaliceSpentContext);
  const featureId = useContext(FeatureIdContext);
  const contentRef = useRef<HTMLDivElement>(null);

  const [configuredCost, setConfiguredCost] = useState(cost);
  const malice = trackerMetadata?.malice ? trackerMetadata.malice : 0;
  const newMalice = malice - configuredCost;

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) setConfiguredCost(cost);
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        side={side}
        align={align}
        alignOffset={alignOffset}
        className="w-fit rounded-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current?.focus();
        }}
      >
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label className="w-full">Current</Label>

              <Input hasFocusHighlight className="w-16 text-center">
                <FreeWheelInput
                  clearContentOnFocus
                  value={malice.toString()}
                  onUpdate={(target) =>
                    updateTrackerMetadata({
                      ...trackerMetadata,
                      malice: parseNumber(target.value, {
                        min: -999,
                        max: 999,
                        truncate: true,
                      }),
                    })
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
              {newMalice}
            </div>
          </div>
          <PopoverClose asChild>
            <Button
              className="w-full"
              onClick={() => {
                updateTrackerMetadata({
                  ...trackerMetadata,
                  malice: newMalice,
                });
                setMaliceSpent({ target: featureId, value: configuredCost });
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

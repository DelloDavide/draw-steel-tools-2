import { ChevronDownIcon, LoaderCircleIcon } from "lucide-react";
import Button from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import { useEffect, useState } from "react";
import { DiceRollResultViewer } from "../../action/diceRoller/DiceRollResultViewer";
import type { Roll } from "../../types/diceRollerTypes";
import {
  Collapsible,
  CollapsibleContent,
} from "../../components/ui/collapsible";

export function ResultDropDown({
  badges = [],
  hidden,
  result,
}: {
  badges?: string[];
  hidden: boolean;
  result: Roll | undefined;
}) {
  const [resultOpen, setResultOpen] = useState(false);

  useEffect(() => {
    if (result === undefined) setResultOpen(false);
  }, [result]);

  return (
    <Collapsible open={hidden}>
      <CollapsibleContent>
        <div className="pt-2">
          {result === undefined ? (
            <div className="border-mirage-300 flex h-[38px] w-full items-center justify-center gap-4 rounded-full border">
              <LoaderCircleIcon className="animate-spin text-black" />
              <div>Rolling Dice</div>
            </div>
          ) : (
            <div>
              <Button
                variant={"outline"}
                className="flex h-fit w-full items-center justify-between py-1.5 pr-2.5 pl-0"
                onClick={() => setResultOpen(!resultOpen)}
              >
                <div className="flex flex-wrap content-start items-center gap-2 px-1.5">
                  {badges.map((value) => (
                    <Badge key={value} className="bg-black" text={value} />
                  ))}
                  <Badge className="bg-black" text={`Total: ${result.total}`} />
                  {result.critical ? (
                    <Badge className="bg-accent" text={`Critical`} />
                  ) : (
                    <Badge className="bg-black" text={`Tier: ${result.tier}`} />
                  )}
                </div>
                <ChevronDownIcon
                  data-open={resultOpen}
                  className="aspect-square shrink-0 transition-transform duration-300 data-[open=true]:rotate-180"
                />
              </Button>
              <Collapsible open={resultOpen}>
                <CollapsibleContent>
                  <div className="pt-2">
                    <div className="border-mirage-300 rounded-2xl border p-2">
                      <DiceRollResultViewer result={result} />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

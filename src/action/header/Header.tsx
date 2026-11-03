import { PlugZap, UnplugIcon } from "lucide-react";
import ConnectedDiceIcon from "../../components/icons/ConnectedDiceIcon";
import Button from "../../components/ui/Button";
import type { DiceRoller, RollAttributes } from "../../types/diceRollerTypes";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import SideBarMenu from "./SideBarMenu";

export function Header({
  setRollAttributes,
  diceRoller,
}: {
  readonly setRollAttributes: React.Dispatch<
    React.SetStateAction<RollAttributes>
  >;
  readonly diceRoller: DiceRoller;
}) {
  const [noDiceRollersFound, setNoDiceRollersFound] = useState(true);
  useEffect(() => {
    if (diceRoller.config) setNoDiceRollersFound(false);
  }, [diceRoller]);

  const connectionControl =
    diceRoller.config === undefined ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => {
              diceRoller.connect();
            }}
            variant={"ghost"}
            size={"icon"}
          >
            <PlugZap />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Connect Dice Roller</TooltipContent>
      </Tooltip>
    ) : (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => {
              diceRoller.disconnect();
              setRollAttributes((prev) => ({
                ...prev,
                style: undefined,
              }));
            }}
            variant={"ghost"}
            size={"icon"}
          >
            <UnplugIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Disconnect Dice Roller</TooltipContent>
      </Tooltip>
    );

  return (
    <div className="flex h-14 items-center gap-2 px-4">
      <h1 className="w-full text-lg font-bold">Draw Steel Tools</h1>

      <div className="flex gap-2">
        {noDiceRollersFound ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant={"ghost"} size={"icon"}>
                <a
                  href="https://seamus-finlayson.ca/pages/connected-dice"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ConnectedDiceIcon className="stroke-black dark:stroke-white" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Get Connected Dice</TooltipContent>
          </Tooltip>
        ) : (
          connectionControl
        )}

        <SideBarMenu />
      </div>
    </div>
  );
}

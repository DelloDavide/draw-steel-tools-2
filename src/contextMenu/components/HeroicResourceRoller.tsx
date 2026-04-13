import { Dice3Icon, LoaderCircleIcon } from "lucide-react";
import Button from "../../components/ui/Button";
import { useDiceRoller } from "../../helpers/useDiceRoller";
import { useState } from "react";
import { getLastDieStyle } from "../../helpers/lastDiceStyle";

export function HeroicResourceRoller({
  variant,
  onResult,
}: {
  variant: "D3" | "D3+1" | "+2" | "+3";
  onResult: (result: number) => void;
}) {
  const [result, setResult] = useState<number>();
  const [rollState, setRollState] = useState<"READY" | "ROLLING" | "DONE">(
    "READY",
  );

  const beginCooldown = (result: number) => {
    onResult(result);
    setResult(result);
    setRollState("DONE");
    setTimeout(() => setRollState("READY"), 10000);
  };

  const diceRoller = useDiceRoller({
    onRollResult: (data) => {
      beginCooldown(data.result[0].result + (variant === "D3+1" ? 1 : 0));
    },
    channel: "tokenEditor",
  });

  return (
    <Button
      disabled={rollState !== "READY"}
      variant={"secondary"}
      size={"lg"}
      className="group h-[54px] shrink grow overflow-clip bg-sky-600/30 p-0 hover:bg-sky-600/30 focus-visible:ring-0 disabled:bg-sky-600/15 disabled:opacity-100 dark:bg-cyan-600/30 hover:dark:bg-cyan-600/30 dark:disabled:bg-cyan-600/15"
      onClick={() => {
        if (variant === "+2") {
          beginCooldown(2);
          return;
        }
        if (variant === "+3") {
          beginCooldown(3);
          return;
        }
        if (!diceRoller.config) {
          if (variant === "D3")
            beginCooldown(Math.floor(Math.random() * 3) + 1);
          if (variant === "D3+1")
            beginCooldown(Math.floor(Math.random() * 3) + 2);
          return;
        }
        setRollState("ROLLING");
        diceRoller.requestRoll({
          styleId: getLastDieStyle()?.id,
          dice: [
            {
              id: `drawSteelTools-${Date.now()}`,
              type: "D3",
            },
          ],
          id: `drawSteelTools-${Date.now()}`,
          gmOnly: false,
          ...(variant === "D3+1" ? { bonus: 1 } : {}),
        });
      }}
    >
      <div className="group-hover:bg-foreground/7 group-focus-visible:bg-foreground/7 grid size-full place-items-center transition-colors">
        {variant.startsWith("+") && <div className="text-lg">{variant}</div>}
        {variant.startsWith("D") && (
          <>
            {rollState === "READY" && (
              <>
                {variant === "D3" && <Dice3Icon />}
                {variant === "D3+1" && (
                  <div className="flex scale-90 items-center">
                    <Dice3Icon />
                    <div className="text-base">+1</div>
                  </div>
                )}
              </>
            )}
            {rollState === "ROLLING" && (
              <LoaderCircleIcon className="animate-spin" />
            )}
            {rollState === "DONE" && (
              <div className="text-lg">{`+${result}`}</div>
            )}
          </>
        )}
      </div>
    </Button>
  );
}

import type { DieResult, Roll } from "../../types/diceRollerTypes";
import { netEdgesTextAndLabel } from "./helpers";
import D10Icon from "../../components/icons/D10Icon";
import { cn } from "../../helpers/utils";
import { Separator } from "../../components/ui/Separator";

const dieKeys = new WeakMap<DieResult, string>();

function getDieKey(die: DieResult) {
  let key = dieKeys.get(die);
  if (key === undefined) {
    key = crypto.randomUUID();
    dieKeys.set(die, key);
  }
  return key;
}

export const DiceRollResultViewer = ({ result }: { result: Roll }) => (
  <div className="space-y-4 pt-[0.5px]">
    <div className="flex flex-col items-center space-y-1.5">
      <div className="text-foreground-secondary text-xs">Roll</div>
      <div className="flex items-center justify-center gap-4">
        {result.dieResults.map((val) => (
          <div
            key={getDieKey(val)}
            className={cn(
              "flex items-center gap-1 stroke-black dark:stroke-white",
              {
                "opacity-45": val.dropped,
              },
            )}
          >
            <D10Icon className="size-5" />
            <div className="flex items-center justify-center text-base font-semibold">
              {val.value}
            </div>
          </div>
        ))}
      </div>
    </div>

    {(result.bonus !== 0 || result.netEdges !== 0 || result.hasSkill) && (
      <>
        <Separator className="opacity-0" />
        <div className="flex justify-center gap-4">
          {result.bonus !== 0 && (
            <TextAndLabel
              text={(result.bonus > 0 ? "+" : "") + result.bonus}
              label="Bonus"
            />
          )}
          {result.hasSkill && <TextAndLabel label="Skill" text="+2" />}
          {result.netEdges !== 0 && (
            <TextAndLabel {...netEdgesTextAndLabel(result.netEdges)} />
          )}
        </div>
      </>
    )}
    <Separator />

    <div className="grid grid-cols-2">
      <TextAndLabel text={result.total.toString()} label="Total" />
      <TextAndLabel
        text={result.critical ? "Critical" : `${result.tier}`}
        label="Tier"
      />
    </div>
  </div>
);

const TextAndLabel = ({ text, label }: { text: string; label: string }) => {
  return (
    <div className="flex flex-col items-center space-y-1 px-3">
      <div className="text-foreground-secondary text-xs text-nowrap">
        {label}
      </div>
      <div className="text-text-primary dark:text-text-primary-dark text-base font-semibold">
        {text}
      </div>
    </div>
  );
};

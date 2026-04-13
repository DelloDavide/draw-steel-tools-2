import { useContext } from "react";
import type { DrawSteelStatblock } from "../../types/DrawSteelZod";
import {
  DiceDrawerContext,
  SetDiceDrawerContext,
  type DiceDrawer,
} from "../context/DiceDrawerContext";
import { SetRollAttributesContext } from "../context/RollAttributesContext";
import { ResultDropDown } from "./ResultDropDown";
import Button from "../../components/ui/Button";
import { PluginReadyGate } from "../../components/logic/PluginReadyGate";

export function Characteristics({
  statblock,
}: {
  statblock: DrawSteelStatblock;
}) {
  const setRollAttributes = useContext(SetRollAttributesContext);
  const diceDrawer = useContext(DiceDrawerContext);
  const setDiceDrawer = useContext(SetDiceDrawerContext);

  const characteristicsId = statblock.name;
  const resultTarget = diceDrawer.powerRollResultTargetId;
  const resultTargetId = resultTarget?.substring(0, resultTarget.indexOf("/"));
  const characteristic = resultTarget?.substring(resultTarget.indexOf("/") + 1);
  const isResultTarget = resultTargetId === characteristicsId;

  return (
    <div className="px-2">
      <div className="flex flex-wrap justify-between gap-1.5 text-sm">
        {[
          { label: "Might", value: statblock.might },
          { label: "Agility", value: statblock.agility },
          { label: "Reason", value: statblock.reason },
          { label: "Intuition", value: statblock.intuition },
          { label: "Presence", value: statblock.presence },
        ].map((item) => (
          <PluginReadyGate
            key={item.label}
            alternate={
              <div className="min-w-16 flex-1 text-center">
                <div className="text-lg">{`${item.value > 0 ? "+" : ""}${item.value}`}</div>
                <div className="-mt-0.5 rounded-sm bg-black font-bold text-white">
                  {item.label}
                </div>
              </div>
            }
          >
            <div className="group min-w-16 flex-1 text-center">
              <div className="flex flex-col pt-1 pb-1.5">
                <Button
                  className="hover:bg-mirage-199"
                  variant={"ghost"}
                  size={"xs"}
                  onClick={() => {
                    setRollAttributes((prev) => ({
                      ...prev,
                      bonus: item.value,
                    }));
                    setDiceDrawer(
                      (prev) =>
                        ({
                          ...prev,
                          open: true,
                          powerRollTargetId: `${characteristicsId}/${item.label}`,
                          powerRollTargetName: item.label,
                        }) satisfies DiceDrawer,
                    );
                  }}
                >
                  <div className="-my-0.5 text-lg">{`${item.value > 0 ? "+" : ""}${item.value}`}</div>
                </Button>
              </div>
              <div className="-mt-0.5 rounded-sm bg-black font-bold text-white">
                {item.label}
              </div>
            </div>
          </PluginReadyGate>
        ))}
      </div>

      <ResultDropDown
        hidden={isResultTarget}
        result={diceDrawer.powerRollResult}
        badges={characteristic ? [characteristic] : []}
      />
    </div>
  );
}

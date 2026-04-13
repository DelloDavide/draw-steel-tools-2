import Button from "../../components/ui/Button";
import { useContext } from "react";
import {
  DiceDrawerContext,
  SetDiceDrawerContext,
} from "../context/DiceDrawerContext";
import { FeatureIdContext } from "../context/FeatureIdContext";
import { generateGroupId } from "../../helpers/generateGroupId";
import type { DiceProtocol } from "../../diceProtocolExport";
import { getLastDieStyle } from "../../helpers/lastDiceStyle";
import parseNumber from "../../helpers/parseNumber";

export function InlineRollButton({ text }: { text: string }) {
  const diceDrawer = useContext(DiceDrawerContext);
  const setDiceDrawer = useContext(SetDiceDrawerContext);
  const featureId = useContext(FeatureIdContext);

  return (
    <Button
      variant={"outline"}
      size={"xs"}
      // className="bg-accent inline rounded-full px-1 whitespace-nowrap text-white"
      onClick={() => {
        let dieCount = parseNumber(text, { truncate: true, min: 1 });
        const dIndex = text.indexOf("d");
        const dieSides = parseNumber(text.substring(dIndex + 1), {
          truncate: true,
          min: 3,
        });
        const plusIndex = text.indexOf("+");
        const bonus =
          plusIndex === -1
            ? 0
            : parseNumber(text.substring(plusIndex + 1), { truncate: true });

        if (!diceDrawer.requestRoll) {
          let total = 0;
          for (let i = 0; i < dieCount; i++) {
            total += Math.trunc(Math.random() * dieSides + 1);
          }
          total += bonus;
          setDiceDrawer((prev) => ({
            ...prev,
            rollResultTargetId: featureId,
            rollText: text,
            rollResult: total,
          }));
          return;
        }

        let type: DiceProtocol.DieType;
        if (dieSides === 3) type = "D3";
        else if (dieSides === 4) type = "D4";
        else if (dieSides === 6) type = "D6";
        else if (dieSides === 8) type = "D8";
        else if (dieSides === 10) type = "D10";
        else if (dieSides === 12) type = "D12";
        else if (dieSides === 20) type = "D20";
        else if (dieSides === 100) type = "D100";
        else throw new Error("Unsupported die type, please report.");

        const dice: DiceProtocol.Die[] = [];
        for (let i = 0; i < dieCount; i++) {
          dice.push({ id: generateGroupId(), type: type });
          if (type === "D100")
            dice.push({ id: generateGroupId(), type: "D10" });
        }

        if (dice.length <= 0) throw new Error("Roll contains no dice.");

        diceDrawer.requestRoll({
          dice: dice,
          bonus,
          id: generateGroupId(),
          gmOnly: false,
          styleId: getLastDieStyle()?.id,
        });
        setDiceDrawer((prev) => ({
          ...prev,
          rollResultTargetId: featureId,
          rollText: text,
          rollResult: undefined,
        }));
      }}
    >
      {text.replaceAll(/\s/g, "").replaceAll("+", " + ")}
    </Button>
  );
}

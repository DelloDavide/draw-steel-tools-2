import { useState } from "react";
import { defaultRollAttributes } from "../../action/diceRoller/helpers";
import type { RollAttributes } from "../../types/diceRollerTypes";
import {
  RollAttributesContext,
  SetRollAttributesContext,
} from "./RollAttributesContext";

export function RollAttributesProvider({
  children,
}: {
  readonly children: any;
}) {
  const [rollAttributes, setRollAttributes] = useState<RollAttributes>(
    defaultRollAttributes,
  );

  return (
    <RollAttributesContext value={rollAttributes}>
      <SetRollAttributesContext value={setRollAttributes}>
        {children}
      </SetRollAttributesContext>
    </RollAttributesContext>
  );
}

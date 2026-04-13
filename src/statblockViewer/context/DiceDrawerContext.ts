import { createContext, type Dispatch, type SetStateAction } from "react";
import type { Roll } from "../../types/diceRollerTypes";
import type { DiceProtocol } from "../../diceProtocolExport";

export type DiceDrawer = {
  open: boolean;
  powerRollResult?: Roll;
  powerRollTargetId?: string;
  powerRollTargetName?: string;
  powerRollResultTargetId?: string;
  rollResult?: number;
  rollText?: string;
  rollResultTargetId?: string;
  requestRoll?: (
    requestRoll: Omit<DiceProtocol.RollRequest, "replyChannel">,
  ) => void;
};
export const defaultDiceDrawer = {
  open: false,
} satisfies DiceDrawer;

export const DiceDrawerContext = createContext<DiceDrawer>(defaultDiceDrawer);
export const SetDiceDrawerContext = createContext<
  Dispatch<SetStateAction<DiceDrawer>>
>(() => {});

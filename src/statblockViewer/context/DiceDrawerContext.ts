import { createContext, type Dispatch, type SetStateAction } from "react";
import type { Roll } from "../../types/diceRollerTypes";
import type { DiceProtocol } from "../../protocols/diceProtocolExport";

export type PendingResourceSpend = {
  featureId: string;
  resourceName: string;
  amount: number;
  type: "hero" | "malice";
};

export type DiceDrawer = {
  open: boolean;
  powerRollResult?: Roll;
  powerRollTargetId?: string;
  powerRollTargetName?: string;
  powerRollResultTargetId?: string;
  pendingResourceSpend?: PendingResourceSpend;
  rollResult?: number;
  rollText?: string;
  rollResultTargetId?: string;
  requestRoll?: (
    requestRoll: Omit<DiceProtocol.RollRequest, "replyChannel">,
  ) => void;
  rollStatus?: "PENDING" | "DONE";
};
export const defaultDiceDrawer = {
  open: false,
} satisfies DiceDrawer;

export const DiceDrawerContext = createContext<DiceDrawer>(defaultDiceDrawer);
export const SetDiceDrawerContext = createContext<
  Dispatch<SetStateAction<DiceDrawer>>
>(() => {});

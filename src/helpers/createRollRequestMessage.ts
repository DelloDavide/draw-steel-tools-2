import { DiceProtocol } from "../diceProtocolExport";

export function createRollRequestMessage(args: {
  gmOnly: boolean;
  bonus: number;
  netEdges: number;
  hasSkill: boolean;
  dice: "2d10" | "3d10kh2" | "3d10kl2";
  styleId?: string;
}): Omit<DiceProtocol.PowerRollRequest, "replyChannel"> {
  const { gmOnly, styleId, ...rollProperties } = args;
  return {
    id: `drawSteelTools-${Date.now()}`,
    styleId,
    gmOnly,
    rollProperties,
  };
}

import { DiceProtocol } from "../diceProtocolExport";

export function getLastDieStyle(): DiceProtocol.DieStyle | undefined {
  const styleId = localStorage.getItem("lastDiceStyleId");
  const styleColor = localStorage.getItem("lastDiceStyleColor");
  return styleColor && styleId ? { color: styleColor, id: styleId } : undefined;
}
export function setLastDieStyle(style: DiceProtocol.DieStyle) {
  localStorage.setItem("lastDiceStyleId", style.id);
  localStorage.setItem("lastDiceStyleColor", style.color);
}

import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { DiceRollResultViewer } from "../src/action/diceRoller/DiceRollResultViewer";
import type { Roll } from "../src/types/diceRollerTypes";

it("preserves duplicate dice identities when earlier dice are removed or values change", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  const root = createRoot(container);
  const result: Roll = {
    timeStamp: 1,
    bonus: 0,
    hasSkill: false,
    netEdges: 0,
    tier: 1,
    critical: false,
    total: 10,
    dieResults: [
      { value: 5, dropped: true },
      { value: 5, dropped: false },
      { value: 5, dropped: false },
    ],
  };
  const dice = () => container.querySelectorAll("svg");
  try {
    await act(async () =>
      root.render(<DiceRollResultViewer result={result} />),
    );
    const secondDie = dice()[1];
    const thirdDie = dice()[2];
    result.dieResults = result.dieResults.slice(1);
    result.dieResults[0].value = 8;
    await act(async () =>
      root.render(<DiceRollResultViewer result={result} />),
    );
    expect(dice()[0]).toBe(secondDie);
    expect(dice()[1]).toBe(thirdDie);
    expect(Object.keys(result.dieResults[0])).toEqual(["value", "dropped"]);
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
});

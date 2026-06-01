import { describe, it, expect } from "vitest";
import { powerRoll, getBonusFromNetEdges } from "../src/action/diceRoller/helpers";

describe("getBonusFromNetEdges", () => {
  it("returns -2 for single bane (-1)", () => {
    expect(getBonusFromNetEdges(-1)).toBe(-2);
  });

  it("returns +2 for single edge (+1)", () => {
    expect(getBonusFromNetEdges(1)).toBe(2);
  });

  it("returns 0 for no edges (0)", () => {
    expect(getBonusFromNetEdges(0)).toBe(0);
  });

  it("returns 0 for double edge (+2) — tier shift, no bonus", () => {
    expect(getBonusFromNetEdges(2)).toBe(0);
  });

  it("returns 0 for double bane (-2) — tier shift, no bonus", () => {
    expect(getBonusFromNetEdges(-2)).toBe(0);
  });
});

describe("powerRoll (givenValues)", () => {
  const base = {
    bonus: 0,
    hasSkill: false,
    netEdges: 0,
    rollMethod: "givenValues" as const,
    selectionStrategy: "highest" as const,
  };

  it("tier 1 for low roll (total < 12)", () => {
    const result = powerRoll({ ...base, dieValues: [3, 4] });
    expect(result.total).toBe(7);
    expect(result.tier).toBe(1);
    expect(result.critical).toBe(false);
  });

  it("tier 2 for mid roll (12 ≤ total < 17)", () => {
    const result = powerRoll({ ...base, dieValues: [6, 8] });
    expect(result.total).toBe(14);
    expect(result.tier).toBe(2);
  });

  it("tier 3 for high roll (total ≥ 17)", () => {
    const result = powerRoll({ ...base, dieValues: [9, 8] });
    expect(result.total).toBe(17);
    expect(result.tier).toBe(3);
  });

  it("critical on natural ≥ 19 (always tier 3)", () => {
    const result = powerRoll({ ...base, dieValues: [10, 9] });
    expect(result.total).toBe(19);
    expect(result.critical).toBe(true);
    expect(result.tier).toBe(3);
  });

  it("critical overrides tier even with double bane", () => {
    const result = powerRoll({ ...base, netEdges: -2, dieValues: [10, 10] });
    expect(result.critical).toBe(true);
    // Critical → tier 3, then double bane → tier 2
    expect(result.tier).toBe(2);
  });

  it("skill adds +2 to total", () => {
    const result = powerRoll({ ...base, hasSkill: true, dieValues: [5, 5] });
    expect(result.total).toBe(12); // 10 + 2
    expect(result.tier).toBe(2);
  });

  it("single edge adds +2 bonus", () => {
    const result = powerRoll({ ...base, netEdges: 1, dieValues: [5, 5] });
    expect(result.total).toBe(12); // 10 + 2
  });

  it("single bane subtracts -2", () => {
    const result = powerRoll({ ...base, netEdges: -1, dieValues: [7, 7] });
    expect(result.total).toBe(12); // 14 - 2
  });

  it("double edge shifts tier up (no bonus)", () => {
    const result = powerRoll({ ...base, netEdges: 2, dieValues: [5, 5] });
    expect(result.total).toBe(10); // no bonus
    expect(result.tier).toBe(2); // tier 1 → shifted to 2
  });

  it("double bane shifts tier down (no bonus)", () => {
    const result = powerRoll({ ...base, netEdges: -2, dieValues: [9, 8] });
    expect(result.total).toBe(17);
    expect(result.tier).toBe(2); // tier 3 → shifted to 2
  });

  it("double edge does not exceed tier 3", () => {
    const result = powerRoll({ ...base, netEdges: 2, dieValues: [9, 8] });
    expect(result.tier).toBe(3); // already tier 3, stays 3
  });

  it("double bane does not go below tier 1", () => {
    const result = powerRoll({ ...base, netEdges: -2, dieValues: [3, 4] });
    expect(result.tier).toBe(1); // already tier 1, stays 1
  });

  it("drops lowest die with 3 dice and highest strategy", () => {
    const result = powerRoll({
      ...base,
      dieValues: [2, 8, 6],
      selectionStrategy: "highest",
    });
    // sorted: [2, 6, 8] → keep highest 2: 6 + 8 = 14
    expect(result.total).toBe(14);
    expect(result.dieResults.find((d) => d.value === 2)?.dropped).toBe(true);
  });

  it("drops highest die with 3 dice and lowest strategy", () => {
    const result = powerRoll({
      ...base,
      dieValues: [2, 8, 6],
      selectionStrategy: "lowest",
    });
    // sorted: [2, 6, 8] → keep lowest 2: 2 + 6 = 8
    expect(result.total).toBe(8);
    expect(result.dieResults.find((d) => d.value === 8)?.dropped).toBe(true);
  });

  it("bonus is added to total", () => {
    const result = powerRoll({ ...base, bonus: 3, dieValues: [5, 5] });
    expect(result.total).toBe(13); // 10 + 3
    expect(result.bonus).toBe(3);
  });

  it("throws on invalid netEdges", () => {
    expect(() =>
      powerRoll({ ...base, netEdges: 5, dieValues: [5, 5] }),
    ).toThrow("Invalid Edges Value");
  });
});

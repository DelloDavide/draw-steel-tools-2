import { describe, expect, it } from "vitest";
import { DrawSteelStatblockZod } from "../src/types/DrawSteelZod";

const statblock = {
  name: "Antares",
  type: "statblock",
  level: 4,
  roles: ["Hero"],
  ancestry: ["Revenant"],
  ev: "72",
  stamina: "36",
  speed: 6,
  size: "1S",
  stability: 0,
  free_strike: 11,
  might: -1,
  agility: 1,
  reason: 4,
  intuition: 1,
  presence: 2,
};

describe("DrawSteelStatblockZod", () => {
  it("accepts hero progression fields when present", () => {
    expect(
      DrawSteelStatblockZod.parse({
        ...statblock,
        victories: 1,
        experience_points: 54,
      }),
    ).toMatchObject({
      victories: 1,
      experience_points: 54,
    });
  });

  it("keeps hero progression fields optional", () => {
    expect(DrawSteelStatblockZod.parse(statblock)).not.toHaveProperty(
      "experience_points",
    );
    expect(DrawSteelStatblockZod.parse(statblock)).not.toHaveProperty(
      "victories",
    );
  });
});

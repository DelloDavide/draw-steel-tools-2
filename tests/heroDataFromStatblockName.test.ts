import { beforeEach, describe, expect, it, vi } from "vitest";
import { HeroDataBundleZod } from "../src/types/heroDataBundlesZod";

const mocks = vi.hoisted(() => ({
  getHeroDataBundle: vi.fn(),
}));

vi.mock("../src/statblockSearch/helpers/getHeroDataBundle", () => ({
  getHeroDataBundle: mocks.getHeroDataBundle,
}));

import { heroDataFromStatblockName } from "../src/helpers/heroDataFromStatblockName";

describe("heroDataFromStatblockName", () => {
  beforeEach(() => {
    mocks.getHeroDataBundle.mockReset();
  });

  it("loads an indexed hero with normalized optional bundle paths", async () => {
    mocks.getHeroDataBundle.mockResolvedValue(
      HeroDataBundleZod.parse({
        key: "Antares",
        statblock: {
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
        },
        featuresBlocks: [],
      }),
    );

    await heroDataFromStatblockName("Antares");

    expect(mocks.getHeroDataBundle).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Antares",
        statblock: "Heroes/Antares/Statblocks/Antares.json",
        skills: ["Heroes/Antares/Skills/Antares Skills.json"],
        projectBlocks: ["Heroes/Antares/Projects/Antares Projects.json"],
        inventoryBlocks: ["Heroes/Antares/Inventory/Antares Inventory.json"],
      }),
    );
  });

  it("rejects a name that is not present in the hero index", async () => {
    await expect(heroDataFromStatblockName("Missing Hero")).rejects.toThrow(
      "Could not find statblock with name Missing Hero",
    );
    expect(mocks.getHeroDataBundle).not.toHaveBeenCalled();
  });
});

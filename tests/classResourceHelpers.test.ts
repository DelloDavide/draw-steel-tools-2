import { describe, expect, it } from "vitest";
import type { DefinedHeroTokenData } from "../src/types/tokenDataZod";
import { HeroDataBundleZod } from "../src/types/heroDataBundlesZod";
import {
  buildInitialClassResourcePools,
  extractClassResourceNamesFromHeroBundle,
  getMergedClassResourcePools,
  updateClassResourcePool,
} from "../src/helpers/classResourceHelpers";

const emptyHero: DefinedHeroTokenData = {
  type: "HERO",
  name: "Antares",
  gmOnly: false,
  stamina: 36,
  staminaMaximum: 36,
  temporaryStamina: 0,
  heroicResource: 0,
  recoveries: 0,
  surges: 0,
  statblockName: "Antares",
  heroicResourceButton: "D3",
  heroicResourceName: "",
  classResourcePools: {},
  notes: "",
};

function createFeature(
  featureType: string,
  cost?: string,
  name = "Test Feature",
) {
  return {
    name,
    type: "feature",
    feature_type: featureType,
    icon: "",
    effects: [],
    ...(cost === undefined ? {} : { cost }),
  };
}

function createHeroBundle() {
  return HeroDataBundleZod.parse({
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
      features: [createFeature("ability", "2 Focus", "Statblock Feature")],
    },
    featuresBlocks: [
      {
        name: "Class Features",
        type: "featureblock",
        featureblock_type: "Features",
        flavor: "",
        features: [
          createFeature("Elementalist Feature", "2 Focus"),
          createFeature("Fury Feature", "3 Ferocity"),
          createFeature("Fury Feature", "1 Focus"),
          createFeature("Tactician Feature", "1 Malice"),
          createFeature("Trait", "4 Trait Points"),
          createFeature("Ability", "not a resource cost"),
        ],
      },
    ],
  });
}

describe("hero class resources", () => {
  it("extracts unique class resources, ignores Malice, and sorts names", () => {
    expect(extractClassResourceNamesFromHeroBundle(createHeroBundle())).toEqual([
      "Ferocity",
      "Focus",
    ]);
  });

  it("returns no resource names when a hero has no resource costs", () => {
    const hero = createHeroBundle();
    hero.featuresBlocks[0].features = [
      createFeature("Elementalist Feature", "Main Action"),
    ];
    hero.statblock.features = [];

    expect(extractClassResourceNamesFromHeroBundle(hero)).toEqual([]);
  });

  it("merges the primary heroic resource over its pool value", () => {
    const hero = {
      ...emptyHero,
      heroicResourceName: "Focus",
      heroicResource: 5,
      classResourcePools: { Focus: 2, Ferocity: 3 },
    };

    expect(getMergedClassResourcePools(hero)).toEqual({
      Focus: 5,
      Ferocity: 3,
    });
    expect(hero.classResourcePools.Focus).toBe(2);
  });

  it("keeps all class pools when no primary resource is selected", () => {
    const hero = {
      ...emptyHero,
      heroicResourceName: "",
      classResourcePools: { Ferocity: 3 },
    };

    expect(getMergedClassResourcePools(hero)).toEqual({ Ferocity: 3 });
  });

  it("updates the primary resource and its matching pool together", () => {
    expect(
      updateClassResourcePool(
        {
          ...emptyHero,
          heroicResourceName: "Focus",
          heroicResource: 2,
          classResourcePools: { Focus: 2, Ferocity: 1 },
        },
        "Focus",
        4,
      ),
    ).toEqual({
      classResourcePools: { Focus: 4, Ferocity: 1 },
      heroicResource: 4,
    });
  });

  it("updates a secondary resource without changing the primary resource", () => {
    expect(
      updateClassResourcePool(
        {
          ...emptyHero,
          heroicResourceName: "Focus",
          heroicResource: 2,
          classResourcePools: { Focus: 2 },
        },
        "Ferocity",
        3,
      ),
    ).toEqual({
      classResourcePools: { Focus: 2, Ferocity: 3 },
    });
  });

  it("selects the first resource when a hero has no primary resource", () => {
    expect(
      updateClassResourcePool(emptyHero, "Ferocity", 3),
    ).toEqual({
      classResourcePools: { Ferocity: 3 },
      heroicResource: 3,
      heroicResourceName: "Ferocity",
    });
  });

  it("initializes missing pools and retains existing values", () => {
    const hero = {
      ...emptyHero,
      classResourcePools: { Focus: 3 },
    };

    expect(buildInitialClassResourcePools(hero, ["Focus", "Ferocity"])).toEqual({
      classResourcePools: { Focus: 3, Ferocity: 0 },
      heroicResourceName: "Focus",
      heroicResource: 3,
    });
  });

  it("synchronizes the primary value into its pool", () => {
    const hero = {
      ...emptyHero,
      heroicResourceName: "Focus",
      heroicResource: 4,
      classResourcePools: { Focus: 1 },
    };

    expect(buildInitialClassResourcePools(hero, ["Focus"])).toEqual({
      classResourcePools: { Focus: 4 },
    });
  });

  it("does not create a patch when all pools are already initialized", () => {
    const hero = {
      ...emptyHero,
      heroicResourceName: "Focus",
      heroicResource: 2,
      classResourcePools: { Focus: 2, Ferocity: 0 },
    };

    expect(
      buildInitialClassResourcePools(hero, ["Focus", "Ferocity"]),
    ).toBeUndefined();
  });

  it("does not create pools when the hero has no class resources", () => {
    expect(buildInitialClassResourcePools(emptyHero, [])).toBeUndefined();
  });
});

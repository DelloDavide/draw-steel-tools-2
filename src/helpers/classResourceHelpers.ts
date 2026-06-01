import type { DrawSteelFeature } from "../types/DrawSteelZod";
import type { HeroDataBundle } from "../types/heroDataBundlesZod";
import type { DefinedHeroTokenData } from "../types/tokenDataZod";
import { parseResourceCost } from "./parseResourceCost";

const CLASS_FEATURE_TYPE_PATTERN =
  /(?:aspect|fury|null|conduit|elementalist|tactician)\s*feature/i;

function collectResourceNamesFromFeatures(features: DrawSteelFeature[]): string[] {
  const names = new Set<string>();

  for (const feature of features) {
    if (!feature.cost) continue;
    const parsed = parseResourceCost(feature.cost);
    if (!parsed) continue;
    if (parsed.resourceName.toLowerCase() === "malice") continue;
    names.add(parsed.resourceName);
  }

  return [...names];
}

export function extractClassResourceNamesFromHeroBundle(
  heroData: HeroDataBundle,
): string[] {
  const names = new Set<string>();

  for (const block of heroData.featuresBlocks) {
    const classFeatures = block.features.filter((feature) =>
      CLASS_FEATURE_TYPE_PATTERN.test(feature.feature_type),
    );
    for (const name of collectResourceNamesFromFeatures(classFeatures)) {
      names.add(name);
    }
  }

  for (const name of collectResourceNamesFromFeatures(
    heroData.statblock.features ?? [],
  )) {
    names.add(name);
  }

  return [...names].sort((a, b) => a.localeCompare(b));
}

export function getMergedClassResourcePools(
  hero: DefinedHeroTokenData,
): Record<string, number> {
  const pools = { ...hero.classResourcePools };

  if (hero.heroicResourceName !== "") {
    pools[hero.heroicResourceName] = hero.heroicResource;
  }

  return pools;
}

export function updateClassResourcePool(
  hero: DefinedHeroTokenData,
  resourceName: string,
  value: number,
): Partial<DefinedHeroTokenData> {
  const pools = { ...hero.classResourcePools, [resourceName]: value };
  const patch: Partial<DefinedHeroTokenData> = {
    classResourcePools: pools,
  };

  if (
    hero.heroicResourceName === resourceName ||
    hero.heroicResourceName === ""
  ) {
    patch.heroicResource = value;
    if (hero.heroicResourceName === "") {
      patch.heroicResourceName = resourceName;
    }
  }

  return patch;
}

export function buildInitialClassResourcePools(
  hero: DefinedHeroTokenData,
  resourceNames: string[],
): Partial<DefinedHeroTokenData> | undefined {
  if (resourceNames.length === 0) return undefined;

  const pools = { ...hero.classResourcePools };
  let changed = false;

  for (const name of resourceNames) {
    if (!(name in pools)) {
      pools[name] = 0;
      changed = true;
    }
  }

  const patch: Partial<DefinedHeroTokenData> = {};

  if (changed) {
    patch.classResourcePools = pools;
  }

  if (hero.heroicResourceName === "" && resourceNames.length > 0) {
    patch.heroicResourceName = resourceNames[0];
    patch.heroicResource = pools[resourceNames[0]] ?? 0;
  } else if (
    hero.heroicResourceName !== "" &&
    pools[hero.heroicResourceName] !== hero.heroicResource
  ) {
    pools[hero.heroicResourceName] = hero.heroicResource;
    patch.classResourcePools = pools;
  }

  if (Object.keys(patch).length === 0) return undefined;
  return patch;
}

const CLASS_RESOURCE_COLORS = [
  "cornflowerblue",
  "mediumpurple",
  "teal",
  "indianred",
  "gray",
  "darkcyan",
  "darkmagenta",
  "sienna",
  "olive",
  "steelblue",
  "slateblue",
  "darkslategray",
  "mediumslateblue",
  "cadetblue",
  "rosybrown",
  "darkseagreen",
  "mediumorchid",
  "lightslategray",
  "slategray",
  "lightsteelblue",
  "orchid",
  "darkolivegreen",
  "lightslateblue",
  "lightseagreen",
  "plum",
  "darkslateblue",
  "lightsteelblue",
  "mediumaquamarine",
  "thistle",
  "darkcyan",
  "mediumpurple",
] as const;

export function classResourceColor(resourceName: string): string {
  let hash = 0;
  for (let i = 0; i < resourceName.length; i++) {
    hash = (hash + resourceName.charCodeAt(i) * (i + 1)) % 997;
  }
  return CLASS_RESOURCE_COLORS[hash % CLASS_RESOURCE_COLORS.length];
}

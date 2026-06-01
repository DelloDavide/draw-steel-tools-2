import type { HeroDataBundle } from "./heroDataBundlesZod";
import type { MonsterDataBundle } from "./monsterDataBundlesZod";
import type { DynamicTerrainDataBundle } from "./dynamicTerrainDataBundlesZod";

export type CreatureDataBundle =
  | (MonsterDataBundle & { kind: "monster" })
  | (HeroDataBundle & { kind: "hero" })
  | (DynamicTerrainDataBundle & { kind: "dynamicterrain" });

export function getCreatureName(creature: CreatureDataBundle | null | undefined) {
  if (!creature) return undefined;
  if (creature.kind === "dynamicterrain") return creature.terrain.name;
  return creature.statblock.name;
}

import type { Item, Layer } from "@owlbear-rodeo/sdk";

export type PluginItemType = "HERO" | "MONSTER" | "MINION" | "TERRAIN";
type Requirement = { types: string[]; layers: Layer[] };

export const pluginItemRequirements: Record<PluginItemType, Requirement[]> = {
  HERO: [{ types: ["IMAGE"], layers: ["CHARACTER", "MOUNT"] }],
  MONSTER: [{ types: ["IMAGE"], layers: ["CHARACTER", "MOUNT"] }],
  MINION: [{ types: ["IMAGE"], layers: ["CHARACTER", "MOUNT"] }],
  TERRAIN: [
    { types: ["IMAGE"], layers: ["MAP"] },
    { types: ["SHAPE", "CURVE"], layers: ["MAP", "DRAWING"] },
  ],
};

const pluginItemRequirementEntries = Object.entries(pluginItemRequirements);

function checkRequirement(requirement: Requirement, item: Item) {
  if (!requirement.types.includes(item.type)) return false;
  if (!requirement.layers.includes(item.layer)) return false;
  return true;
}

export function getValidPluginTypes(item: Item): PluginItemType[] {
  return pluginItemRequirementEntries
    .filter((entry) =>
      entry[1].some((requirement) => checkRequirement(requirement, item)),
    )
    .map((entry) => entry[0] as PluginItemType);
}

export function checkItemIsValidPluginType(
  item: Item,
  type: PluginItemType,
): boolean {
  return pluginItemRequirements[type].some((requirement) =>
    checkRequirement(requirement, item),
  );
}

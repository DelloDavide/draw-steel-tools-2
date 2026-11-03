import { type Metadata } from "@owlbear-rodeo/sdk";
import { parseMetadata } from "./parseMetadata";
import { getPluginId } from "./getPluginId";
import {
  CharacterTokenDataZod,
  type DefinedCharacterTokenData,
  type DefinedHeroTokenData,
  type DefinedMinionTokenData,
  type DefinedMonsterTokenData,
  type DefinedTerrainTokenData,
} from "../types/tokenDataZod";

export const TOKEN_METADATA_KEY = getPluginId("metadata");

export const defaultMonsterTokenData: DefinedMonsterTokenData = {
  type: "MONSTER",
  name: "",
  gmOnly: true,
  stamina: 0,
  staminaMaximum: 0,
  temporaryStamina: 0,
  statblockName: "",
  resourceId: "",
};

export const defaultHeroTokenData: DefinedHeroTokenData = {
  type: "HERO",
  name: "",
  gmOnly: false,
  stamina: 0,
  staminaMaximum: 0,
  temporaryStamina: 0,
  heroicResource: 0,
  recoveries: 0,
  surges: 0,
  statblockName: "",
  heroicResourceButton: "D3",
  heroicResourceName: "",
  classResourcePools: {},
  notes: "",
};

export const defaultMinionTokenData: DefinedMinionTokenData = {
  type: "MINION",
  groupId: "",
};

export const defaultTerrainTokenData: DefinedTerrainTokenData = {
  type: "TERRAIN",
  name: "",
  gmOnly: true,
  stamina: 0,
  staminaMaximum: 0,
  statblockName: "",
  resourceId: "",
};

export function parseTokenData(metadata: Metadata): DefinedCharacterTokenData {
  const characterData = parseMetadata(
    metadata,
    TOKEN_METADATA_KEY,
    CharacterTokenDataZod.parse,
  );

  if (characterData === undefined) {
    console.error(metadata[TOKEN_METADATA_KEY]);
    throw new Error("Could not parse token data.");
  }

  if (characterData.type === "MONSTER")
    return { ...defaultMonsterTokenData, ...characterData };
  if (characterData.type === "MINION")
    return { ...defaultMinionTokenData, ...characterData };
  if (characterData.type === "TERRAIN")
    return { ...defaultTerrainTokenData, ...characterData };
  if (characterData.type === "HERO" || characterData.type === undefined)
    return {
      ...defaultHeroTokenData,
      ...characterData,
      classResourcePools: {
        ...defaultHeroTokenData.classResourcePools,
        ...characterData?.classResourcePools,
      },
    } as DefinedCharacterTokenData;
  throw new Error("Unhandled character data type.");
}

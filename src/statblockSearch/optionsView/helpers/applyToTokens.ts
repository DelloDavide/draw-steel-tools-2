import OBR, { type Item } from "@owlbear-rodeo/sdk";
import z from "zod";
import { generateGroupId } from "../../../helpers/generateGroupId";
import { MONSTER_GROUPS_METADATA_KEY } from "../../../helpers/monsterGroupHelpers";
import { TOKEN_METADATA_KEY } from "../../../helpers/tokenHelpers";
import { MinionGroupZod, type MinionGroup } from "../../../types/minionGroup";
import {
  HeroTokenDataZod,
  type HeroTokenData,
  TerrainTokenDataZod,
  type TerrainTokenData,
  MonsterTokenDataZod,
  type MonsterTokenData,
  MinionTokenDataZod,
  type MinionTokenData,
} from "../../../types/tokenDataZod";
import type { SetupOptions } from "../../helpers/AppState";
import type { IndexBundle } from "../../../types/monsterDataBundlesZod";

export async function ApplyToTokens(
  setupOptions: SetupOptions,
  indexBundle: IndexBundle | "NONE",
  targetItems: Item[],
) {
  if (setupOptions.type === "HERO") {
    OBR.scene.items.updateItems(targetItems, (items) => {
      items.forEach((item) => {
        const existingDataValidation = HeroTokenDataZod.safeParse(
          item.metadata[TOKEN_METADATA_KEY],
        );
        item.metadata[TOKEN_METADATA_KEY] = HeroTokenDataZod.parse({
          ...(existingDataValidation.success
            ? existingDataValidation.data
            : undefined),
          type: "HERO",
          gmOnly: setupOptions.gmOnly.value,
          ...(setupOptions.name.enabled
            ? { name: setupOptions.name.value }
            : {}),
          ...(setupOptions.stamina.enabled
            ? {
                stamina: setupOptions.stamina.value,
                staminaMaximum: setupOptions.stamina.value,
              }
            : {}),
          ...(typeof indexBundle === "object"
            ? { statblockName: indexBundle.name }
            : {}),
        } satisfies HeroTokenData);
        if (setupOptions.name.enabled) item.name = setupOptions.name.value;
      });
    });
  } else if (setupOptions.type === "TERRAIN") {
    const nameOptions = setupOptions.name;
    const staminaOptions = setupOptions.stamina;
    OBR.scene.items.updateItems(targetItems, (items) => {
      items.forEach((item) => {
        const existingDataValidation = TerrainTokenDataZod.safeParse(
          item.metadata[TOKEN_METADATA_KEY],
        );
        item.metadata[TOKEN_METADATA_KEY] = TerrainTokenDataZod.parse({
          ...(existingDataValidation.success
            ? existingDataValidation.data
            : undefined),
          type: "TERRAIN",
          gmOnly: setupOptions.gmOnly.value,
          ...(nameOptions.enabled && nameOptions.nameTag
            ? { name: nameOptions.value }
            : {}),
          ...(staminaOptions.enabled
            ? {
                stamina: staminaOptions.value,
                staminaMaximum: staminaOptions.value,
              }
            : {}),
          ...(typeof indexBundle === "object"
            ? {
                statblockName: indexBundle.name,
                resourceId: indexBundle.id,
              }
            : {}),
        } satisfies TerrainTokenData);
        if (nameOptions.enabled) {
          item.name = nameOptions.value;
        }
      });
    });
  } else if (setupOptions.type === "MONSTER") {
    const nameOptions = setupOptions.name;
    const staminaOptions = setupOptions.stamina;
    OBR.scene.items.updateItems(targetItems, (items) => {
      items.forEach((item) => {
        const existingDataValidation = MonsterTokenDataZod.safeParse(
          item.metadata[TOKEN_METADATA_KEY],
        );
        item.metadata[TOKEN_METADATA_KEY] = MonsterTokenDataZod.parse({
          ...(existingDataValidation.success
            ? existingDataValidation.data
            : undefined),
          type: "MONSTER",
          gmOnly: setupOptions.gmOnly.value,
          ...(nameOptions.enabled && nameOptions.nameTag
            ? { name: nameOptions.value }
            : {}),
          ...(staminaOptions.enabled
            ? {
                stamina: staminaOptions.value,
                staminaMaximum: staminaOptions.value,
              }
            : {}),
          ...(typeof indexBundle === "object"
            ? {
                statblockName: indexBundle.name,
                resourceId: indexBundle.id,
              }
            : {}),
        } satisfies MonsterTokenData);
        if (nameOptions.enabled) {
          item.name = nameOptions.value;
        }
      });
    });
  } else if (setupOptions.type === "MINION") {
    let groupSize = targetItems.length;
    const newGroupId = generateGroupId();

    OBR.scene.items.updateItems(targetItems, (items) => {
      items.forEach(async (item) => {
        const existingDataValidation = MinionTokenDataZod.safeParse(
          item.metadata[TOKEN_METADATA_KEY],
        );
        item.metadata[TOKEN_METADATA_KEY] = MinionTokenDataZod.parse({
          ...(existingDataValidation.success
            ? existingDataValidation.data
            : undefined),
          type: "MINION",
          groupId: newGroupId,
        } satisfies MinionTokenData);
        item.name = setupOptions.groupName.value;
      });
    });

    const minionGroups = z
      .array(MinionGroupZod)
      .safeParse((await OBR.scene.getMetadata())[MONSTER_GROUPS_METADATA_KEY]);

    OBR.scene.setMetadata({
      [MONSTER_GROUPS_METADATA_KEY]: z.array(MinionGroupZod).parse([
        ...(minionGroups.success
          ? minionGroups.data.filter((value) => value.id !== newGroupId)
          : []),
        {
          type: "MINION",
          id: newGroupId,
          individualStamina: setupOptions.stamina.value,
          name: setupOptions.groupName.value,
          ...(typeof indexBundle === "object"
            ? {
                statblock: indexBundle.name,
                resourceId: indexBundle.id,
              }
            : {}),
          currentStamina: setupOptions.stamina.value * groupSize,
          nameTagsEnabled: setupOptions.groupName.nameTags,
          gmOnly: setupOptions.gmOnly.value,
        },
      ] satisfies MinionGroup[]),
    });
  }
}

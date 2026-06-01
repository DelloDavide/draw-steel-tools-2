import type { KeyFilter } from "@owlbear-rodeo/sdk";
import { TOKEN_METADATA_KEY } from "../helpers/tokenHelpers";

/**
 * Reusable typed filter fragments for OBR context menu registration.
 *
 * These helpers eliminate the duplicated `KeyFilter` literals scattered
 * across `createContextMenuItems.ts`, making the intent clearer and
 * ensuring consistency if the metadata schema changes.
 */

/** Matches items on CHARACTER or MOUNT layers that are images. */
export const IMAGE_ON_TOKEN_LAYER: KeyFilter[] = [
  { key: "layer", value: "CHARACTER", coordinator: "||" },
  { key: "layer", value: "MOUNT" },
  { key: "type", value: "IMAGE" },
];

/** Matches items that have Draw Steel token metadata attached. */
export const HAS_TOKEN_METADATA: KeyFilter = {
  key: ["metadata", TOKEN_METADATA_KEY],
  value: undefined,
  operator: "!=",
};

/** Matches items that do NOT have Draw Steel token metadata. */
export const NO_TOKEN_METADATA: KeyFilter = {
  key: ["metadata", TOKEN_METADATA_KEY],
  value: undefined,
  operator: "==",
};

/** Matches items NOT marked as gmOnly. */
export const NOT_GM_ONLY: KeyFilter = {
  key: ["metadata", TOKEN_METADATA_KEY, "gmOnly"],
  value: true,
  operator: "!=",
};

/** Filter by token type (HERO / MONSTER / MINION). */
export function tokenTypeIs(
  type: "HERO" | "MONSTER" | "MINION",
): KeyFilter {
  return {
    key: ["metadata", TOKEN_METADATA_KEY, "type"],
    value: type,
    operator: "==",
  };
}

/** Filter excluding a specific token type. */
export function tokenTypeIsNot(
  type: "HERO" | "MONSTER" | "MINION",
): KeyFilter {
  return {
    key: ["metadata", TOKEN_METADATA_KEY, "type"],
    value: type,
    operator: "!=",
  };
}

/** Filter matching a specific minion group id. */
export function minionGroupIs(groupId: string): KeyFilter {
  return {
    key: ["metadata", TOKEN_METADATA_KEY, "groupId"],
    value: groupId,
    operator: "==",
  };
}

/** Filter excluding a specific minion group id. */
export function minionGroupIsNot(groupId: string): KeyFilter {
  return {
    key: ["metadata", TOKEN_METADATA_KEY, "groupId"],
    value: groupId,
    operator: "!=",
  };
}

/**
 * Height constants for context menu embed sizing.
 *
 * These values MUST match the rendered pixel heights of the corresponding
 * sections in the contextMenu iframe (TokenEditor / MinionContextMenu).
 * If the UI layout changes, update these values accordingly.
 */

/** Top + bottom padding of the embed container */
export const VERTICAL_PADDING = 16;

/** NameInput row: input (36px) + label gap (18px) + bottom margin (8px) */
export const NAME_HEIGHT = 36 + 18 + 8;

/** Full hero stat editor (stamina bar + heroic resource + recoveries + surges + notes) */
export const HERO_STATS_HEIGHT = 178;

/** Monster stat editor: stamina bar (54px) + temp stamina row (62px) */
export const MONSTER_STATS_HEIGHT = 54 + 62;

/** Minion group editor height (stamina + individual stamina + name tags toggle) */
export const MINION_STATS_HEIGHT = 178;

/** GM-only visibility toggle: switch (20px) + label (16px) + bottom margin (8px) */
export const ACCESS_TOGGLE_HEIGHT = 20 + 16 + 8;

import OBR, { buildImage, buildShape, type Image } from "@owlbear-rodeo/sdk";
import { afterAll, describe, expect, it, vi } from "vitest";
import {
  checkItemChanges,
  checkMetadataChanges,
  checkNeedsRefresh,
} from "../src/background/itemChangeHandling/checkChanges";
import { getUpdateBundles } from "../src/background/itemChangeHandling/getUpdateBundles";
import type { ObrState } from "../src/background/types";
import { defaultSettings } from "../src/helpers/settingsHelpers";
import {
  defaultHeroTokenData,
  defaultMonsterTokenData,
  defaultTerrainTokenData,
  defaultMinionTokenData,
  TOKEN_METADATA_KEY,
} from "../src/helpers/tokenHelpers";
import type { DefinedCharacterTokenData } from "../src/types/tokenDataZod";

vi.spyOn(OBR.player, "id", "get").mockReturnValue("test-user");
afterAll(() => vi.restoreAllMocks());

function image(data: DefinedCharacterTokenData = defaultHeroTokenData): Image {
  return buildImage(
    {
      width: 100,
      height: 100,
      url: "https://example.com/token.png",
      mime: "image/png",
    },
    { dpi: 100, offset: { x: 0, y: 0 } },
  )
    .id("token")
    .layer("CHARACTER")
    .metadata({ [TOKEN_METADATA_KEY]: data })
    .build();
}

function state(item: Image, tracked = true): ObrState {
  return {
    items: [item],
    playerRole: "GM",
    minionGroups: [],
    minionTokenCounts: {},
    settings: defaultSettings,
    sceneDpi: 100,
    themeMode: "LIGHT",
    attachmentLogs: tracked
      ? {
          [item.id]: {
            item,
            data: item.metadata[
              TOKEN_METADATA_KEY
            ] as DefinedCharacterTokenData,
            attachmentIds: [],
          },
        }
      : {},
  };
}

describe("item changes", () => {
  it("compares image grids and shape sizes only for matching item kinds", () => {
    const prev = image();
    expect(checkItemChanges(prev, prev)).toBe(false);
    for (const grid of [
      { ...prev.grid, dpi: prev.grid.dpi + 1 },
      {
        ...prev.grid,
        offset: { ...prev.grid.offset, x: prev.grid.offset.x + 1 },
      },
      {
        ...prev.grid,
        offset: { ...prev.grid.offset, y: prev.grid.offset.y + 1 },
      },
    ]) {
      const changed = { ...prev, grid };
      expect(checkItemChanges(changed, prev)).toBe(true);
    }
    const shape = buildShape().build();
    const wider = { ...shape, width: shape.width + 1 };
    const taller = { ...shape, height: shape.height + 1 };
    expect(checkItemChanges(wider, shape)).toBe(true);
    expect(checkItemChanges(taller, shape)).toBe(true);
    expect(checkItemChanges(shape, shape)).toBe(false);
    expect(
      checkItemChanges(
        {
          ...shape,
          position: prev.position,
          layer: prev.layer,
          visible: prev.visible,
        },
        prev,
      ),
    ).toBe(false);
  });

  it("refreshes names only with enabled name tags and always refreshes scale changes", () => {
    const prev = image();
    const renamed = { ...prev, name: `${prev.name} changed` };
    expect(checkNeedsRefresh(renamed, prev, false)).toBe(false);
    expect(checkNeedsRefresh(renamed, prev, true)).toBe(true);
    expect(
      checkNeedsRefresh(
        { ...prev, scale: { ...prev.scale, y: 2 } },
        prev,
        false,
      ),
    ).toBe(true);
  });

  it.each([
    [
      defaultHeroTokenData,
      [
        "name",
        "gmOnly",
        "stamina",
        "staminaMaximum",
        "temporaryStamina",
        "heroicResource",
        "surges",
      ],
    ],
    [
      defaultMonsterTokenData,
      ["name", "gmOnly", "stamina", "staminaMaximum", "temporaryStamina"],
    ],
    [defaultTerrainTokenData, ["name", "gmOnly", "stamina", "staminaMaximum"]],
    [defaultMinionTokenData, ["groupId"]],
  ] as const)("detects only the tracked fields for $0.type", (data, fields) => {
    expect(checkMetadataChanges(data, data)).toBe(false);
    for (const field of fields) {
      const value = data[field as keyof typeof data];
      const changed =
        typeof value === "boolean"
          ? !value
          : typeof value === "number"
            ? value + 1
            : `${value} changed`;
      expect(checkMetadataChanges({ ...data, [field]: changed }, data)).toBe(
        true,
      );
    }
  });

  it("continues to ignore non-overlay hero metadata and detects type changes", () => {
    expect(
      checkMetadataChanges(
        {
          ...defaultHeroTokenData,
          recoveries: 5,
          notes: "new",
          statblockName: "new",
          classResourcePools: { Focus: 5 },
        },
        defaultHeroTokenData,
      ),
    ).toBe(false);
    expect(
      checkMetadataChanges(defaultMonsterTokenData, defaultHeroTokenData),
    ).toBe(true);
  });
});

describe("update bundles", () => {
  it("uses state items only when no item change list is supplied", () => {
    const prev = image();
    const obrState = state(prev);
    expect(getUpdateBundles(obrState, {}).map((bundle) => bundle.type)).toEqual(
      ["UNCHANGED"],
    );
    expect(getUpdateBundles(obrState, { items: [] })).toEqual([]);
  });

  it("keeps explicit updates ahead of timestamps and refreshes ahead of ordinary changes", () => {
    const prev = { ...image(), lastModified: "2026-01-01T00:00:10.000Z" };
    const obrState = state(prev);
    for (const changed of [{ settings: true }, { role: true }]) {
      expect(getUpdateBundles(obrState, changed)[0].type).toBe("UPDATE");
    }
    const stale = {
      ...prev,
      lastModified: "2026-01-01T00:00:09.000Z",
      scale: { x: 2, y: 2 },
    };
    expect(getUpdateBundles(obrState, { items: [stale] })[0].type).toBe(
      "UNCHANGED",
    );
    const refreshed = {
      ...stale,
      lastModified: "2026-01-01T00:00:11.000Z",
      position: { x: 20, y: 20 },
    };
    expect(getUpdateBundles(obrState, { items: [refreshed] })[0].type).toBe(
      "REFRESH",
    );
    const moved = {
      ...prev,
      lastModified: "2026-01-01T00:00:11.000Z",
      position: { x: 20, y: 20 },
    };
    expect(getUpdateBundles(obrState, { items: [moved] })[0].type).toBe(
      "UPDATE",
    );
    const damaged = {
      ...prev,
      lastModified: "2026-01-01T00:00:11.000Z",
      metadata: {
        [TOKEN_METADATA_KEY]: { ...defaultHeroTokenData, stamina: 5 },
      },
    };
    expect(getUpdateBundles(obrState, { items: [damaged] })[0].type).toBe(
      "UPDATE",
    );
  });

  it("updates minions on group changes but not other token types", () => {
    const minion = image(defaultMinionTokenData);
    expect(getUpdateBundles(state(minion), { minions: true })[0].type).toBe(
      "UPDATE",
    );
    const hero = image();
    expect(getUpdateBundles(state(hero), { minions: true })[0].type).toBe(
      "UNCHANGED",
    );
  });

  it("adds valid untracked tokens and removes invalid tracked tokens", () => {
    const prev = image();
    expect(getUpdateBundles(state(prev, false), {})[0].type).toBe("ADD");
    for (const invalid of [
      { ...prev, metadata: {} },
      { ...prev, layer: "TEXT" as const },
      { ...prev, metadata: { [TOKEN_METADATA_KEY]: defaultTerrainTokenData } },
    ]) {
      expect(getUpdateBundles(state(prev), { items: [invalid] })[0].type).toBe(
        "REMOVE",
      );
      expect(
        getUpdateBundles(state(prev, false), { items: [invalid] })[0].type,
      ).toBe("UNTRACKED");
    }
  });
});

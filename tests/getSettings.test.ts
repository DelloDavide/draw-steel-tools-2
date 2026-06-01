import { describe, it, expect } from "vitest";
import {
  getSettings,
  defaultSettings,
} from "../src/helpers/settingsHelpers";

describe("getSettings", () => {
  it("returns defaults when metadata has no settings key", () => {
    const result = getSettings({});
    expect(result.settings).toEqual(defaultSettings);
    expect(result.isChanged).toBe(true);
  });

  it("returns isChanged true when no currentSettings provided", () => {
    const result = getSettings({});
    expect(result.isChanged).toBe(true);
  });

  it("returns isChanged false when settings are identical", () => {
    const result = getSettings({}, defaultSettings);
    expect(result.isChanged).toBe(false);
  });

  it("detects a change in a single field", () => {
    const current = { ...defaultSettings, showHealthBars: true };
    const result = getSettings({}, current);
    // metadata has no settings → defaults applied, showHealthBars differs
    expect(result.isChanged).toBe(true);
  });
});

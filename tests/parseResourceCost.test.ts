import { describe, expect, it } from "vitest";
import {
  isMaliceResourceCost,
  parseResourceCost,
} from "../src/helpers/parseResourceCost";

describe("parseResourceCost", () => {
  it("parses numeric resource costs", () => {
    expect(parseResourceCost("5 Ferocity")).toEqual({
      amount: 5,
      resourceName: "Ferocity",
    });
    expect(parseResourceCost("3 Malice")).toEqual({
      amount: 3,
      resourceName: "Malice",
    });
  });

  it("returns undefined for non-matching costs", () => {
    expect(parseResourceCost("Main action")).toBeUndefined();
    expect(parseResourceCost("Triggered Action")).toBeUndefined();
  });

  it("detects malice costs", () => {
    expect(isMaliceResourceCost("3 Malice")).toBe(true);
    expect(isMaliceResourceCost("5 Ferocity")).toBe(false);
  });
});

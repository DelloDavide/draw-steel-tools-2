import { describe, it, expect } from "vitest";
import parseNumber from "../src/helpers/parseNumber";

describe("parseNumber", () => {
  it("parses a plain integer", () => {
    expect(parseNumber("42")).toBe(42);
  });

  it("parses a plain float", () => {
    expect(parseNumber("3.14")).toBeCloseTo(3.14);
  });

  it("returns 0 for non-numeric input", () => {
    expect(parseNumber("abc")).toBe(0);
  });

  it("returns custom fallback for non-numeric input", () => {
    expect(parseNumber("abc", { fallback: 5 })).toBe(5);
  });

  it("clamps to min", () => {
    expect(parseNumber("-10", { min: 0 })).toBe(0);
  });

  it("clamps to max", () => {
    expect(parseNumber("100", { max: 50 })).toBe(50);
  });

  it("truncates decimals when truncate is true", () => {
    expect(parseNumber("3.99", { truncate: true })).toBe(3);
  });

  describe("inline math", () => {
    it("adds with + prefix", () => {
      expect(
        parseNumber("+7", { inlineMath: { previousValue: 10 } }),
      ).toBe(17);
    });

    it("subtracts with - prefix", () => {
      expect(
        parseNumber("-3", { inlineMath: { previousValue: 10 } }),
      ).toBe(7);
    });

    it("replaces with = prefix (ignores previous value)", () => {
      expect(
        parseNumber("=25", { inlineMath: { previousValue: 10 } }),
      ).toBe(25);
    });

    it("replaces with =+ prefix (absolute, not added)", () => {
      expect(
        parseNumber("=+5", { inlineMath: { previousValue: 10 } }),
      ).toBe(5);
    });

    it("replaces with =- prefix (absolute negative)", () => {
      expect(
        parseNumber("=-5", { inlineMath: { previousValue: 10 } }),
      ).toBe(-5);
    });

    it("uses plain number as replacement when no +/- prefix", () => {
      expect(
        parseNumber("20", { inlineMath: { previousValue: 10 } }),
      ).toBe(20);
    });

    it("applies min/max after inline math", () => {
      expect(
        parseNumber("+100", { inlineMath: { previousValue: 10 }, max: 50 }),
      ).toBe(50);
    });
  });
});

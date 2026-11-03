import OBR, { buildShape, isCurve, isLabel, isText } from "@owlbear-rodeo/sdk";
import { afterAll, describe, expect, it, vi } from "vitest";
import {
  createTokenOverlay,
  type Bar,
} from "../src/background/overlays/createTokenOverlay";
import {
  createHealthBar,
  createStatBubble,
  DIAMETER,
  FULL_BAR_HEIGHT,
  SHORT_BAR_HEIGHT,
} from "../src/background/overlays/compoundItemHelpers";
import { getOriginAndBounds } from "../src/background/overlays/mathHelpers";
import { defaultSettings } from "../src/helpers/settingsHelpers";

vi.spyOn(OBR.player, "id", "get").mockReturnValue("test-user");
afterAll(() => vi.restoreAllMocks());

const item = buildShape()
  .id("token")
  .shapeType("RECTANGLE")
  .width(100)
  .height(100)
  .visible(false)
  .build();
const fullBar: Bar = {
  value: -5,
  maximum: 20,
  variant: "full",
  lightBackground: true,
  display: true,
  segments: 4,
};
const shortBar: Bar = { ...fullBar, value: 5, variant: "short" };

describe("token overlays", () => {
  it.each([false, true])(
    "preserves attachment order, visibility, IDs and stacked offsets with top justification %s",
    (justifyHealthBarsTop) => {
      const settings = { ...defaultSettings, justifyHealthBarsTop };
      const { origin, bounds } = getOriginAndBounds(settings, item, 100);
      const attachments = createTokenOverlay(
        {
          bars: [fullBar, { ...fullBar, display: false }, shortBar],
          bubbles: [
            { value: 1, color: "blue", display: false },
            { value: 2, color: "blue", display: true },
            { value: 3, color: "green", display: true },
          ],
          nameTags: [
            { text: "Hidden", display: false },
            { text: "Shown", display: true },
          ],
        },
        item,
        100,
        settings,
      );
      expect(attachments.map((attachment) => attachment.id)).toEqual([
        "token-health-background",
        "token-health-fill",
        "token-health-text",
        "token-health-background",
        "token-health-fill",
        "token-1-bg",
        "token-1-text",
        "token-2-bg",
        "token-2-text",
        "token-name-tag",
      ]);
      expect(
        attachments.every(
          (attachment) =>
            attachment.attachedTo === item.id && !attachment.visible,
        ),
      ).toBe(true);
      const stackHeight = FULL_BAR_HEIGHT + SHORT_BAR_HEIGHT + 4;
      const bubbleY =
        origin.y -
        DIAMETER / 2 -
        2 +
        (justifyHealthBarsTop ? DIAMETER + 2 : -stackHeight);
      expect(attachments[5].position).toEqual({
        x: origin.x + bounds.width / 2 - DIAMETER / 2 - 2,
        y: bubbleY,
      });
      expect(attachments[7].position).toEqual({
        x: attachments[5].position.x - DIAMETER - 2,
        y: bubbleY,
      });
      const label = attachments[9];
      expect(isLabel(label)).toBe(true);
      if (!isLabel(label)) throw new Error("Expected name label");
      expect(label.position).toEqual({
        x: origin.x,
        y: origin.y - (justifyHealthBarsTop ? stackHeight + 2 : 0),
      });
      expect(label.style.pointerDirection).toBe(
        justifyHealthBarsTop ? "DOWN" : "UP",
      );
    },
  );

  it("keeps full-bar and segment defaults and negative fill coloring", () => {
    const { origin, bounds } = getOriginAndBounds(defaultSettings, item, 100);
    const options = { health: -5, maxHealth: 20, lightBackground: false };
    const implicit = createHealthBar(item, bounds, origin, options);
    const explicit = createHealthBar(item, bounds, origin, {
      ...options,
      variant: "full",
      segments: 0,
    });
    expect(
      implicit.map((attachment) => ({ ...attachment, lastModified: 0 })),
    ).toEqual(
      explicit.map((attachment) => ({ ...attachment, lastModified: 0 })),
    );
    expect(implicit).toHaveLength(3);
    expect(isCurve(implicit[1])).toBe(true);
    if (!isCurve(implicit[1])) throw new Error("Expected health fill curve");
    expect(implicit[1].style.fillColor).toBe("red");
    expect(
      createHealthBar(item, bounds, origin, { ...options, variant: "short" }),
    ).toHaveLength(2);
  });

  it("keeps ellipsis text for long bubble values", () => {
    const text = createStatBubble(
      item,
      1000,
      "blue",
      { x: 10, y: 10 },
      "bg",
      "text",
    )[1];
    expect(isText(text)).toBe(true);
    if (!isText(text)) throw new Error("Expected bubble text");
    expect(text.text.plainText).toBe("…");
  });

  it("returns no attachments for missing or empty overlay lists", () => {
    expect(createTokenOverlay({}, item, 100, defaultSettings)).toEqual([]);
    expect(
      createTokenOverlay(
        { bars: [], bubbles: [], nameTags: [] },
        item,
        100,
        defaultSettings,
      ),
    ).toEqual([]);
  });
});

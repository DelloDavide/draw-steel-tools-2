import { isCurve, isImage, isShape, type Item } from "@owlbear-rodeo/sdk";
import { getOriginAndBounds } from "./mathHelpers";
import type { DefinedSettings } from "../../types/settingsZod";
import {
  bubbleBackgroundId,
  bubbleTextId,
  createHealthBar,
  createNameTag,
  createStatBubble,
  DIAMETER,
  FULL_BAR_HEIGHT,
  SHORT_BAR_HEIGHT,
} from "./compoundItemHelpers";

export type Bubble = {
  color: string;
  value: number | string;
  display: boolean;
};

export type Bar = {
  value: number;
  maximum: number;
  variant: "full" | "short";
  lightBackground: boolean;
  display: boolean;
  segments: number;
};

export type NameTag = {
  text: string;
  display: boolean;
};

const MARGIN = 2;

export function createTokenOverlay(
  {
    bubbles,
    bars,
    nameTags,
  }: {
    bubbles?: Bubble[];
    bars?: Bar[];
    nameTags?: NameTag[];
  },
  item: Item,
  dpi: number,
  settings: DefinedSettings,
) {
  if (!isImage(item) && !isShape(item) && !isCurve(item))
    throw new Error(`Support for item type ${item.type} is not implemented.`);

  const { origin, bounds } = getOriginAndBounds(settings, item, dpi);
  const overlayAttachments: Item[] = [];

  const bubblePosition = {
    x: origin.x + bounds.width / 2 - DIAMETER / 2 - MARGIN,
    y: origin.y - DIAMETER / 2 - MARGIN,
  };

  const nameTagPosition = {
    x: origin.x,
    y: origin.y,
  };

  if (!!bars) {
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      if (bar.display) {
        overlayAttachments.push(
          ...createHealthBar(
            item,
            bounds,
            bar.value,
            bar.maximum,
            bar.lightBackground,
            origin,
            bar.variant,
            bar.segments,
          ),
        );
      }
    }
  }

  if (settings.justifyHealthBarsTop) bubblePosition.y += DIAMETER + MARGIN;
  const displayedBars = bars?.filter((bar) => bar.display);
  if (
    displayedBars &&
    displayedBars.length > 0 &&
    !settings.justifyHealthBarsTop
  ) {
    const fullBars = displayedBars.filter((bar) => bar.variant === "full");
    bubblePosition.y += -fullBars.length * (FULL_BAR_HEIGHT + MARGIN);
    const shortBars = displayedBars.filter((bar) => bar.variant === "short");
    bubblePosition.y += -shortBars.length * (SHORT_BAR_HEIGHT + MARGIN);
  }

  if (!!bubbles) {
    for (let i = 0; i < bubbles.length; i++) {
      const bubble = bubbles[i];
      if (bubble.display) {
        overlayAttachments.push(
          ...createStatBubble(
            item,
            bubble.value,
            bubble.color,
            bubblePosition,
            bubbleBackgroundId(item.id, i),
            bubbleTextId(item.id, i),
          ),
        );

        bubblePosition.x -= DIAMETER + MARGIN;
      }
    }
  }

  if (settings.justifyHealthBarsTop) nameTagPosition.y -= MARGIN;
  if (
    settings.justifyHealthBarsTop &&
    displayedBars &&
    displayedBars.length > 0
  ) {
    const fullBars = displayedBars.filter((bar) => bar.variant === "full");
    nameTagPosition.y -= fullBars.length * (FULL_BAR_HEIGHT + MARGIN);
    const shortBars = displayedBars.filter((bar) => bar.variant === "short");
    nameTagPosition.y -= shortBars.length * (SHORT_BAR_HEIGHT + MARGIN);
  }

  if (!!nameTags) {
    for (let i = 0; i < nameTags.length; i++) {
      const nameTag = nameTags[i];
      if (nameTags[i].display) {
        overlayAttachments.push(
          ...createNameTag(
            item,
            dpi,
            nameTag.text,
            nameTagPosition,
            settings.justifyHealthBarsTop ? "DOWN" : "UP",
          ),
        );
      }
    }
  }

  return overlayAttachments;
}

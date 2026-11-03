import {
  type Vector2,
  type Image,
  Math2,
  type Shape,
  isImage,
  isShape,
  type Curve,
  isCurve,
  type Item,
  type BoundingBox,
} from "@owlbear-rodeo/sdk";
import type { DefinedSettings } from "../../types/settingsZod";

/**
 * Calculate the fill of a bar tracker to display.
 * @param value - Value to fill bar with.
 * @param maxValue - Maximum value of filled bar.
 * @param segments - Optional parameter to only show a certain number of segments in the bar.
 * @returns The portion of the bar to be filled (between 0 and 1).
 */
export function getFillPortion(value: number, maxValue: number, segments = 0) {
  if (value === 0) return 0;
  if (2 * value <= -maxValue) return -1;
  if (value < 0) return (2 * value) / maxValue;
  if (value >= maxValue) return 1;
  if (segments === 0) return value / maxValue;
  return Math.ceil((value / maxValue) * segments) / segments;
}

/**
 * Generates a curve in the shape of a rounded rectangle for Owlbear Rodeo.
 * @param maxLength - length of rectangle with fill of 1.
 * @param height - Height of rectangle.
 * @param radius - Corner radius of rectangle.
 * @param fill - Portion of rectangle to draw (between 0 and 1).
 * @param pointsInCorner - Number of points to generate in each corner of the rectangle.
 * @returns Array of points generated along the edge of the rounded rectangle.
 */
export function createRoundedRectangle(
  maxLength: number,
  height: number,
  radius: number,
  fill = 1,
  pointsInCorner = 10,
): Vector2[] {
  if (radius * 2 > height) {
    radius = height * 0.5;
  }

  let flipPoints = false;
  if (fill < 0) {
    flipPoints = true;
    fill = Math.abs(fill);
  }

  const shapePoints = getShapePoints();

  if (flipPoints) {
    const flippedShapePoints: Vector2[] = [];
    for (const point of shapePoints) {
      flippedShapePoints.push({
        x: -1 * point.x + maxLength,
        y: point.y,
      });
    }
    return flippedShapePoints;
  }

  return shapePoints;

  function getShapePoints(): Vector2[] {
    if (fill >= 1) {
      // Draw full shape
      return [
        { x: radius, y: 0 },
        { x: maxLength - radius, y: 0 },
        ...drawArc(
          { x: maxLength - radius, y: radius },
          radius,
          Math.PI * 0.5,
          -Math.PI * 0.5,
          pointsInCorner,
        ),
        ...drawArc(
          { x: maxLength - radius, y: height - radius },
          radius,
          0,
          -Math.PI * 0.5,
          pointsInCorner,
        ),
        { x: maxLength - radius, y: height },
        { x: 0 + radius, y: height },
        ...drawArc(
          { x: radius, y: height - radius },
          radius,
          -Math.PI * 0.5,
          -Math.PI * 0.5,
          pointsInCorner,
        ),
        ...drawArc(
          { x: radius, y: radius },
          radius,
          -Math.PI,
          -Math.PI * 0.5,
          pointsInCorner,
        ),
      ];
    }

    const barLength = fill * maxLength;
    if (barLength < radius) {
      // Draw only part of the left end
      const referenceAngle = Math.acos((radius - barLength) / radius);

      return [
        ...drawArc(
          { x: radius, y: height - radius },
          radius,
          Math.PI + referenceAngle,
          -referenceAngle,
          pointsInCorner,
        ),
        ...drawArc(
          { x: radius, y: radius },
          radius,
          Math.PI,
          -referenceAngle,
          pointsInCorner,
        ),
      ];
    }

    const remainingBarLength = maxLength - barLength;
    if (remainingBarLength < radius) {
      // Draw the left end the middle and part of the right end
      const referenceAngle = Math.acos((radius - remainingBarLength) / radius);

      return [
        { x: radius, y: 0 },
        { x: maxLength - radius, y: 0 },
        ...drawArc(
          { x: maxLength - radius, y: radius },
          radius,
          Math.PI * 0.5,
          -Math.PI * 0.5 + referenceAngle,
          pointsInCorner,
        ),
        ...drawArc(
          { x: maxLength - radius, y: height - radius },
          radius,
          -referenceAngle,
          -Math.PI * 0.5 + referenceAngle,
          pointsInCorner,
        ),
        { x: maxLength - radius, y: height },
        { x: radius, y: height },
        ...drawArc(
          { x: radius, y: height - radius },
          radius,
          -Math.PI * 0.5,
          -Math.PI * 0.5,
          pointsInCorner,
        ),
        ...drawArc(
          { x: radius, y: radius },
          radius,
          -Math.PI,
          -Math.PI * 0.5,
          pointsInCorner,
        ),
      ];
    }

    // Draw the left end and the middle
    return [
      { x: radius, y: 0 },
      { x: barLength, y: 0 },
      { x: barLength, y: height },
      { x: radius, y: height },
      ...drawArc(
        { x: radius, y: height - radius },
        radius,
        -Math.PI * 0.5,
        -Math.PI * 0.5,
        pointsInCorner,
      ),
      ...drawArc(
        { x: radius, y: radius },
        radius,
        -Math.PI,
        -Math.PI * 0.5,
        pointsInCorner,
      ),
    ];
  }
}

/** Generates a curve in the shape of an arc of a circle for Owlbear Rodeo.
 * @param center - Center coordinates of the circle.
 * @param radius - Radius of the circle from which the arc is taken.
 * @param startAngle - Angle from standard position to start at in radians.
 * @param arcAngle - Angle from the start angle that the arc is generated over.
 * @param arcPoints - Number of points along the arc to generate.
 * @returns Array of points generated along the arc.
 */
function drawArc(
  center: Vector2,
  radius: number,
  startAngle: number,
  arcAngle: number,
  arcPoints: number,
): Vector2[] {
  arcPoints--; // An extra point is added in the loop to draw start and end points properly
  const pointsArray: Vector2[] = [];
  const angleBetweenPoints = arcAngle / arcPoints;
  let angle = startAngle;
  for (let i = 0; i <= arcPoints; i++) {
    pointsArray.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y - radius * Math.sin(angle), // y-axis is flipped to convert from standard position to OBR coordinates
    });
    angle += angleBetweenPoints;
  }
  return pointsArray;
}

type Bounds = {
  width: number;
  height: number;
};
export function getOriginAndBounds(
  settings: DefinedSettings,
  item: Item,
  dpi: number,
): {
  origin: Vector2;
  bounds: Bounds;
} {
  let center: Vector2;
  let unsafeBounds: Bounds;

  if (isShape(item) || isCurve(item)) {
    const boundingBox = getBoundingBox(item);
    center = Math2.add(boundingBox.center, item.position);
    unsafeBounds = { width: boundingBox.width, height: boundingBox.height };
  } else if (isImage(item)) {
    unsafeBounds = getImageDimensions(item, dpi);
    center = getImageCenter(item, dpi);
  } else throw new Error("Unsupported Item Type");

  const bounds: Bounds = {
    width: Math.max(unsafeBounds.width, dpi),
    height: Math.max(unsafeBounds.height, dpi),
  };
  const origin = {
    x: center.x,
    y:
      center.y +
      ((settings.justifyHealthBarsTop ? -1 : 1) * bounds.height) / 2 -
      settings.verticalOffset +
      (settings.justifyHealthBarsTop ? 1 : 0),
  };
  return { origin, bounds };
}

function getImageDimensions(item: Image, dpi: number) {
  const dpiScale = dpi / item.grid.dpi;
  const width = Math.abs(item.image.width * dpiScale * item.scale.x);
  const height = Math.abs(item.image.height * dpiScale * item.scale.y);
  return { width, height };
}

function getImageCenter(image: Image, sceneDpi: number) {
  // Image center with respect to image center
  let imageCenter = { x: 0, y: 0 };

  // Find image center with respect to image top left corner
  imageCenter = Math2.add(
    imageCenter,
    Math2.multiply(
      {
        x: image.image.width,
        y: image.image.height,
      },
      0.5,
    ),
  );

  // Find image center with respect to item position
  imageCenter = Math2.subtract(imageCenter, image.grid.offset);
  imageCenter = Math2.multiply(imageCenter, sceneDpi / image.grid.dpi); // scale switch from image to scene
  imageCenter = Math2.multiply(imageCenter, image.scale);
  imageCenter = Math2.rotate(imageCenter, { x: 0, y: 0 }, image.rotation);

  // find image center with respect to world
  imageCenter = Math2.add(imageCenter, image.position);

  return imageCenter;
}

function getBoundingBox(item: Shape | Curve): BoundingBox {
  let points: Vector2[] = [];
  if (isCurve(item)) points = item.points;
  else if (item.shapeType === "RECTANGLE")
    points = [
      { x: 0, y: 0 },
      { x: item.width, y: 0 },
      { x: item.width, y: item.height },
      { x: 0, y: item.height },
    ];
  else if (item.shapeType === "TRIANGLE")
    points = [
      { x: 0, y: 0 },
      { x: 0.5 * item.width, y: item.height },
      { x: -0.5 * item.width, y: item.height },
    ];
  else if (item.shapeType === "HEXAGON") {
    const minDimension = Math.min(item.height, item.width);
    return {
      center: { x: 0, y: 0 },
      width: minDimension,
      height: minDimension,
      min: { x: minDimension / 2, y: minDimension / 2 },
      max: { x: minDimension / 2, y: minDimension / 2 },
    };
  } else if (item.shapeType === "CIRCLE") {
    const sqrt1_4 = 0.29 * Math.SQRT2;
    points = [
      { x: 0, y: -0.5 * item.height },
      { x: sqrt1_4 * item.width, y: -sqrt1_4 * item.height },
      { x: 0, y: 0.5 * item.height },
      { x: sqrt1_4 * item.width, y: sqrt1_4 * item.height },
      { x: 0.5 * item.width, y: 0 },
      { x: -sqrt1_4 * item.width, y: sqrt1_4 * item.height },
      { x: -0.5 * item.width, y: 0 },
      { x: -sqrt1_4 * item.width, y: -sqrt1_4 * item.height },
    ];
  } else throw new Error("Unsupported Shape Type");

  const angle = item.rotation;
  const origin = { x: 0, y: 0 };
  const rotated = points.map((point) => Math2.rotate(point, origin, angle));

  const boundingBox = Math2.boundingBox(rotated);
  return boundingBox;
}

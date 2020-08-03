import { screen } from 'electron';

export function getNonOverlappingBounds(rect, bounds) {
  let newX = rect.x;
  let newY = rect.y;
  let newWidth = rect.width;
  let newHeight = rect.height;

  let workArea = screen.getDisplayMatching(bounds).workArea;
  let overlap = getOverlap(bounds, workArea);

  if (overlap.height > 50 && overlap.width > 50 && bounds.y > workArea.y) {
    newX = bounds.x;
    newY = bounds.y;
  }

  if (bounds.width <= workArea.width || bounds.height <= workArea.height) {
    newWidth = bounds.width;
    newHeight = bounds.height;
  }

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight
  };
}

function getOverlap(rectA, rectB) {
  let intersectX1 = Math.max(rectA.x, rectB.x);
  let intersectX2 = Math.min(rectA.x + rectA.width, rectB.x + rectB.width);

  if (intersectX2 < intersectX1) {
    return;
  }

  let intersectY1 = Math.max(rectA.y, rectB.y);
  let intersectY2 = Math.min(rectA.y + rectA.height, rectB.y + rectB.height);

  if (intersectY2 < intersectY1) {
    return;
  }

  return {
    x: intersectX1,
    y: intersectY1,
    width: intersectX2 - intersectX1,
    height: intersectY2 - intersectY1
  };
}

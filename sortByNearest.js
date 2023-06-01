import { distance } from "./distance.js";

export const sortByNearest = (toColor, colors) =>
  [...colors].sort((c1, c2) => {
    const d2 = distance(toColor, c2);
    const d1 = distance(toColor, c1);
    const d = d1 - d2;
    return d;
  });

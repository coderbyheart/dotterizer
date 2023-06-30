import getPixels from "get-pixels";
import { promisify } from "node:util";
import os from "node:os";
import fs from "node:fs/promises";
const getPixelsAsync = promisify(getPixels);
import { colors } from "./colors.js";
import Color from "color";
import { sortByNearest } from "./sortByNearest.js";

const dotSize = 8;
const distance = 8;
const dotsPerColor = 260 * 3;

const photoFile = process.argv[process.argv.length - 1];
const svgFile = photoFile + ".svg";
const templateFile = photoFile + ".template.svg";
const colorsFile = photoFile + ".colors.svg";
const pixels = await getPixelsAsync(photoFile);

const [width, height] = pixels.shape.slice();

console.log(width, height);

const dots = [];
for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    const [r, g, b] = [
      pixels.get(x, y, 0),
      pixels.get(x, y, 1),
      pixels.get(x, y, 2),
    ];
    dots.push([x, y, Color.rgb([r, g, b])]);
  }
}
dots.sort(() => (Math.random() > 0.5 ? 1 : -1));

const colorList = colors.map(([c]) => Color(c));
const colorCount = colors.reduce(
  (count, [c]) => ({ ...count, [c]: dotsPerColor }),
  {}
);

const usedColors = [];

const coloredPreview = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   width="${width * distance}mm"
   height="${height * distance}mm"
   viewBox="0 0 ${width * distance} ${height * distance}"
   version="1.1"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <g>
    ${dots
      .map(([x, y, color]) => {
        const nearestColor = sortByNearest(color, colorList)[0];
        if (colorCount[nearestColor.hex()] === 0) {
          usedColors.push([x, y, null]);
          return;
        }
        colorCount[nearestColor.hex()]--;
        usedColors.push([x, y, nearestColor]);
        return [
          // style="fill:transparent;stroke-width:0.1;stroke:#000000;"
          `<circle
            style="fill:${nearestColor.hex()};stroke-width:1mm;stroke-color:#cc0000"
            cx="${distance * x + distance / 2}"
            cy="${distance * y + distance / 2}"
            r="${dotSize / 2}" />`,
        ].join(os.EOL);
      })
      .join(os.EOL)}
  </g>
</svg>
`;

console.log(colorCount);

const template = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   width="${width * distance}mm"
   height="${height * distance}mm"
   viewBox="0 0 ${width * distance} ${height * distance}"
   version="1.1"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <g>
    ${usedColors
      .map(([x, y, color]) => {
        return [
          `<circle
            style="fill:transparent;stroke-width:0.1;stroke:#000000;"
            cx="${distance * x + distance / 2}"
            cy="${distance * y + distance / 2}"
            r="${dotSize / 2}" />`,
          `<text
            style="font-size:4px;text-align:center;text-anchor:middle;text-color:#000000"
            x="${distance * x + distance / 2}"
            y="${distance * y + distance / 2 + 1}">${
            color !== null ? colorList.indexOf(color) + 1 : "X"
          }</text>`,
        ].join(os.EOL);
      })
      .join(os.EOL)}
  </g>
</svg>
`;

const colorInfo = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   width="${width * distance}mm"
   height="${height * distance}mm"
   viewBox="0 0 ${width * distance} ${height * distance}"
   version="1.1"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <g>
    ${colors
      .map((color, index) => {
        return [
          `<circle
            style="fill:${color[0]};stroke-width:1mm;stroke-color:#cc0000"
            cx="${distance / 2}"
            cy="${distance * index + distance / 2}"
            r="${dotSize / 2}" />`,
          `<circle
              style="fill:transparent;stroke-width:0.1;stroke:#000000;"
              cx="${distance / 2 + distance}"
              cy="${distance * index + distance / 2}"
              r="${dotSize / 2}" />`,
          `<text
            style="font-size:4px;text-align:center;text-anchor:middle;text-color:#000000"
            x="${distance + distance / 2}"
            y="${distance * index + distance / 2 + 1}">${
            colors.indexOf(color) + 1
          }</text>`,
          `<text
            style="font-size:4px;text-align:left;text-anchor:left;text-color:#000000"
            x="${distance * 2}"
            y="${distance * index + distance / 2 + 1}">${color[1]} (${
            dotsPerColor - colorCount[color[0]]
          })</text>`,
        ].join(os.EOL);
      })
      .join(os.EOL)}
  </g>
</svg>
`;

await fs.writeFile(svgFile, coloredPreview, "utf-8");
await fs.writeFile(templateFile, template, "utf-8");
await fs.writeFile(colorsFile, colorInfo, "utf-8");

console.log(`${svgFile} written`);
console.log(`${templateFile} written`);
console.log(`${colorsFile} written`);

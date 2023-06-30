import "./app.css";
import { useEffect, useRef, useState } from "preact/hooks";
import Color from "color";
import { sortByNearest } from "../../sortByNearest.js";

export const App = () => {
  const [imgSrc, setImageSrc] = useState("");
  const canvas = useRef(null);
  const imgRef = useRef(null);
  const [size, setSize] = useState([0, 0]);
  const [colors, setColors] = useState(
    [
      ["#0d910d", "green"],
      ["#e6e6e6", "silver"],
      ["#dcdcdc", "gray"],
      ["#179caf", "cyan"],
      ["#2d2b3b", "black"],
      ["#ffff00", "yellow"],
      ["#e3573b", "red"],
      ["#b191b1", "thistle"],
      ["#ff1493", "dark pink"],
      ["#55a894", "blue"],
      ["#fecb69", "sun"],
      ["#e3e331", "neon yellow"],
      ["#cf8caa", "light pink"],
      ["#523c4e", "dark brown"],
      ["#af7c55", "orange red"],
      ["#50ff50", "neon green"],
      ["#ffffff", "white"],
      ["#800080", "purple"],
      ["#84545c", "brown"],
    ].map(([c, name]) => [c.toLowerCase(), name])
  );
  const colorList = colors.map(([c]) => Color(c));

  useEffect(() => {
    if (!imgSrc) return;
    if (!imgRef.current) return;
    const ctx = canvas.current.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0); // Or at whatever offset you like
    };
    img.src = imgSrc;
  }, [imgSrc, imgRef]);

  const [dots, setDots] = useState([]);
  useEffect(() => {
    const ctx = canvas.current.getContext("2d", {
      willReadFrequently: true,
      alpha: false,
    });
    if (size[0] === 0) return;
    const dots = [];
    for (let x = 0; x < size[0]; x++) {
      for (let y = 0; y < size[1]; y++) {
        const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
        dots.push([x, y, Color.rgb([r, g, b])]);
      }
    }
    dots.sort(() => (Math.random() > 0.5 ? 1 : -1));
    setDots(dots);
  }, [size]);

  const {
    dots: coloredDots,
    colorCount,
    missingCount,
  } = drawDots({
    dots,
    colorList,
    dotsPerColor: 260 * 3,
  });

  return (
    <div style="display: flex">
      {size[0] > 0 && (
        <main style="display: flex; width: 80%;">
          <ColorPreview
            width={size[0]}
            height={size[1]}
            dots={coloredDots}
            distance={8}
            dotSize={8}
          />
          <aside>
            <Template
              width={size[0]}
              height={size[1]}
              dots={coloredDots}
              distance={8}
              dotSize={8}
              colorList={colorList}
              size={size}
              colors={colors}
            />
          </aside>
        </main>
      )}
      <aside>
        <form>
          <input
            type="file"
            onChange={(e) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                setImageSrc(e.target.result);
              };
              reader.readAsDataURL(e.target.files[0]);
            }}
          />
        </form>
        <canvas ref={canvas} width={size[0]} height={size[1]} />
        <img
          src={imgSrc}
          ref={imgRef}
          onLoad={() => {
            const { width, height } = imgRef.current.getBoundingClientRect();
            setSize([width, height]);
          }}
          style={{ visibility: "hidden" }}
        />
        <h2>Colors</h2>
        <ol>
          {colors.map((c, i) => {
            const [color, name] = c;
            return (
              <li>
                <label>
                  <input
                    type="color"
                    value={color}
                    id={`color-${i}`}
                    onChange={(e) => {
                      setColors((colors) => {
                        const newColor = e.target.value;
                        const index = colors.indexOf(c);
                        return [
                          ...colors.slice(0, index),
                          [newColor, name],
                          ...colors.slice(index + 1),
                        ];
                      });
                    }}
                  />
                  <span style="padding-left: 1rem;">{name}</span>
                </label>
              </li>
            );
          })}
        </ol>
        <ol>
          {colors.map(([color, name]) => (
            <li>
              <code>
                ['{color}', '{name}'],
              </code>
            </li>
          ))}
        </ol>
        <h2>Used colors</h2>
        <ol>
          {colorCount.map(([color, count]) => (
            <li>
              {colors.find(([c]) => c === color.toLowerCase())[1]}: {count}
            </li>
          ))}
        </ol>
        <h3>Missing</h3>
        <ol>
          {missingCount.map(([color, count]) => (
            <li>
              {colors.find(([c]) => c === color.toLowerCase())[1]}: {count}
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
};

const ColorPreview = ({ width, height, distance, dots, dotSize }) => (
  <svg
    width={`${width * distance}mm`}
    height={`${height * distance}mm`}
    viewBox={`0 0 ${width * distance} ${height * distance}`}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      {dots.map(([x, y, color]) => (
        <circle
          fill={color?.hex() ?? "white"}
          cx={distance * x + distance / 2}
          cy={distance * y + distance / 2}
          r={dotSize / 2}
        />
      ))}
    </g>
  </svg>
);

const Template = ({
  width,
  height,
  distance,
  dots,
  dotSize,
  colorList,
  size,
  colors,
}) => {
  // 52x74
  const parts = [
    [0, 26, 0, 18],
    [0, 26, 19, 37],
    [0, 26, 38, 56],
    [0, 26, 57, 74],
    [27, 52, 0, 18],
    [27, 52, 19, 37],
    [27, 52, 38, 56],
    [27, 52, 57, 74],
  ];

  return (
    <>
      {parts.map(([minX, maxX, minY, maxY], index) => {
        const shiftedDots = [...dots]
          .filter(([x, y]) => x >= minX && x <= maxX && y >= minY && y <= maxY)
          .map(([x, y, ...rest]) => [x - minX, y - minY, ...rest]);

        const usedColors = [...dots].reduce(
          (usedColors, [, , color]) => [
            ...new Set([...usedColors, color?.hex() ?? "black"]),
          ],
          []
        );

        const usedColorList = usedColors
          .map((color) => {
            const index = colorList.map((c) => c.hex()).indexOf(color);
            const name = colors.find(([c]) => c === color.toLowerCase());
            return [index === -1 ? "X" : index, name?.[1] ?? "black"];
          })
          .sort(([i1], [i2]) => i1 - i2);

        return (
          <section>
            <h2>Part {index + 1}</h2>
            {JSON.stringify(size)}
            <dl>
              <dt>X</dt>
              <dd>
                {minX}-{maxX}
              </dd>
              <dt>Y</dt>
              <dd>
                {minY}-{maxY}
              </dd>
            </dl>
            <TiledTemplate
              width={width / 2}
              height={height / 4}
              distance={distance}
              colorList={colorList}
              dotSize={dotSize}
              dots={shiftedDots}
            />
            <ul>
              {usedColorList.map(([index, name]) => (
                <li>
                  {index}: {name}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
};

const TiledTemplate = ({
  width,
  height,
  distance,
  dots,
  dotSize,
  colorList,
}) => (
  <svg
    width={`${width * distance}mm`}
    height={`${height * distance}mm`}
    viewBox={`0 0 ${width * distance} ${height * distance}`}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      {dots.map(([x, y, color]) => {
        const idx = colorList.indexOf(color);
        return (
          <>
            <circle
              fill="none"
              stroke-width="0.1"
              stroke="#888888"
              cx={distance * x + distance / 2}
              cy={distance * y + distance / 2}
              r={dotSize / 2}
            />
            <text
              font-size="4px"
              text-align="center"
              text-anchor="middle"
              text-color="#888888"
              x={distance * x + distance / 2}
              y={distance * y + distance / 2}
            >
              {color === null ? "X" : idx}
            </text>
          </>
        );
      })}
    </g>
  </svg>
);

const drawDots = ({ dots, colorList, dotsPerColor }) => {
  const colorCount = colorList.reduce(
    (count, c) => ({ ...count, [c.hex()]: dotsPerColor }),
    {}
  );
  const missingCount = colorList.reduce(
    (count, c) => ({ ...count, [c.hex()]: 0 }),
    {}
  );
  const coloredDots = [];
  for (const [x, y, color] of dots) {
    const nearestColor = sortByNearest(color, colorList)[0];
    if (colorCount[nearestColor.hex()] === 0) {
      coloredDots.push([x, y, null]);
      missingCount[nearestColor.hex()]++;
      continue;
    }
    colorCount[nearestColor.hex()]--;
    coloredDots.push([x, y, nearestColor]);
  }
  return {
    dots: coloredDots,
    colorCount: Object.entries(colorCount).map(([color, count]) => [
      color,
      dotsPerColor - count,
    ]),
    missingCount: Object.entries(missingCount).filter(([, c]) => c > 0),
  };
};
